// server.js
require('dotenv').config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const stream = require("stream");
const path = require("path");
const csv = require("csv-parser");
const User = require("./db/userModel");
const GIF = require("./db/gifModel");
const Semester = require("./db/semesterModel");
const TA = require("./db/taModel");
const Card = require("./db/cardModel");
const { sendEmail } = require('./email'); // Import the email sending function
// required for SSO/CAS auth
const session = require('express-session');
const CASAuthentication = require('express-cas-authentication');

const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:3000'; // Define frontend URL


// ---- CONFIG ----
const app = express();
const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required.");
}


// CAS session/proxy setup
app.set('trust proxy', 1);

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
}));


// CORS
app.use(cors({
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"]
}));

const cas = new CASAuthentication({
  cas_url: "https://sso.gatech.edu/cas",
  service_url: process.env.SITE_URL || '',
  cas_version: '3.0',
  session_info: "cas_userinfo",
});

const mapTaRecord = (ta) => {
  if (!ta) return ta;
  return { ...ta, _id: ta.id };
};

const mapCardRecord = (card, defaultContentType = 'image/gif') => {
  if (!card) return card;
  let dataUrl = card.data;

  if (Buffer.isBuffer(card.data)) {
    const base64 = card.data.toString('base64');
    dataUrl = `data:${card.contentType || defaultContentType};base64,${base64}`;
  } else if (typeof card.data === 'string' && !card.data.startsWith('data:')) {
    dataUrl = `data:${card.contentType || defaultContentType};base64,${card.data}`;
  }

  return {
    ...card,
    _id: card.id,
    data: dataUrl,
  };
};

// Body parsing
app.use(express.json({ limit: "50mb" }));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'frontend/build')));


// ---- UPLOADS (multer) ----
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ---- ROUTES ----

// CAS Auth routes
app.get('/login', cas.bounce, (req, res) => res.redirect('/'));
app.get('/logout', cas.logout);
app.get('/whoami', cas.bounce, (req, res) => {
  res.json({ user: req.session[cas.session_name] });
});


// Health
app.get("/health", (_req, res) => res.json({ ok: true }));

// Upload TAs via CSV
app.post("/upload-tas", upload.single("csv"), (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded.");

  const bufferStream = new stream.PassThrough();
  bufferStream.end(req.file.buffer);

  const results = [];
  let semesterName = null;

  const sanitizeRow = (row) => {
    return Object.entries(row).reduce((acc, [rawKey, rawValue]) => {
      const cleanKey = rawKey.replace(/^\uFEFF/, "").trim();
      const cleanValue = typeof rawValue === "string" ? rawValue.trim() : rawValue;
      acc[cleanKey] = cleanValue;
      const lowerKey = cleanKey.toLowerCase();
      if (!(lowerKey in acc)) {
        acc[lowerKey] = cleanValue;
      }
      return acc;
    }, {});
  };

  const pickField = (row, ...keys) => {
    for (const key of keys) {
      if (row[key] !== undefined && row[key] !== "") {
        return row[key];
      }
    }
    return undefined;
  };

  bufferStream
    .pipe(csv())
    .on("data", (data) => {
      const sanitized = sanitizeRow(data);
      if (!semesterName) {
        semesterName = pickField(sanitized, "Semester", "semester");
      }
      results.push(sanitized);
    })
    .on("end", async () => {
      if (!semesterName) {
        return res.status(400).send("CSV must have a 'Semester' column.");
      }

      try {
        const semester = await Semester.findOneAndUpdate(
          { semester: semesterName },
          { fileRef: req.file.originalname, isEnabled: true },
          { upsert: true, new: true }
        );

        await TA.deleteMany({ semester: semesterName });

        const taDocs = [];
        const seen = new Set();

        for (const ta of results) {
          const firstName = ta.FirstName || "";
          const lastName = ta.LastName || "";
          const email = ta["Email"] ? ta["Email"].trim() : "";
          const taClass = ta.Class ? ta.Class.trim() : "";

          if (!email) {
            continue;
          }

          const key = `${email.toLowerCase()}-${semesterName}`;
          if (seen.has(key)) {
            continue;
          }
          seen.add(key);

          taDocs.push({
            name: `${firstName} ${lastName}`.trim(),
            email,
            class: taClass,
            semester: semesterName,
            ref: req.file.originalname,
          });
        }

        if (taDocs.length > 0) {
          await TA.insertMany(taDocs);
        }

        res.status(200).send("TA data uploaded successfully!");
      } catch (err) {
        console.error(err);
        res.status(500).send("Error saving TA data.");
      }
    });
});

// Get all semesters
app.get("/semesters", async (req, res) => {
  try {
    const semesters = await Semester.find();
    res.json(semesters);
  } catch (err) {
    console.error("Error fetching semesters:", err);
    res.status(500).send("Error fetching semesters");
  }
});

// Get enabled semesters
app.get("/semesters/enabled", async (req, res) => {
  try {
    const semesters = await Semester.find({ isEnabled: true });
    res.json(semesters);
  } catch (err) {
    console.error("Error fetching enabled semesters:", err);
    res.status(500).send("Error fetching enabled semesters");
  }
});


// Delete a semester and all associated TAs
app.delete("/semesters/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const semester = await Semester.findById(id);
    if (!semester) {
      return res.status(404).send("No semester found with that ID.");
    }

    await TA.deleteMany({ semester: semester.semester });
    await Semester.findByIdAndDelete(id);

    res.status(200).send("Semester and associated TAs deleted successfully!");
  } catch (err) {
    console.error("Error deleting semester:", err);
    res.status(500).send("Error deleting semester");
  }
});

// Toggle a semester's isEnabled status
app.patch("/semesters/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;
    const semester = await Semester.findById(id);
    if (!semester) {
      return res.status(404).send("No semester found with that ID.");
    }
    const newIsEnabled = !semester.isEnabled;
    await Semester.updateOne(
      { _id: id },
      { $set: { isEnabled: newIsEnabled } }
    );
    res.status(200).send(`Semester ${newIsEnabled ? 'enabled' : 'disabled'} successfully!`);
  } catch (err) {
    console.error("Error toggling semester:", err);
    res.status(500).send("Error toggling semester");
  }
});

app.get("/ta/id/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const ta = await TA.findOne({ email: email });
    if (!ta) {
      return res.status(404).send("TA not found.");
    }
    res.status(200).json({ _id: ta.id });
  } catch (err) {
    console.error("Error fetching TA ID:", err);
    res.status(500).send("Error fetching TA ID");
  }
});

// Get all TAs for a given semester
app.get("/tas/:semester", async (req, res) => {
  try {
    const { semester } = req.params;
    const tas = await TA.find({ semester: semester });
    res.json(tas.map(mapTaRecord));
  } catch (err) {
    console.error("Error fetching TAs:", err);
    res.status(500).send("Error fetching TAs");
  }
});

// Add a TA to a semester (personal add)
app.post("/tas/:semester", async (req, res) => {
  try {
    const { semester } = req.params;
    const { name, email, class: taClass } = req.body;

    const newTa = {
      name,
      email,
      class: taClass,
      semester,
      ref: "personal add",
    };

    const result = await TA.save(newTa);
    const insertedTa = await TA.findById(result.insertId);

    res.status(200).json(mapTaRecord(insertedTa));
  } catch (err) {
    console.error("Error adding TA:", err);
    res.status(500).send("Error adding TA.");
  }
});

// Update a TA
app.put("/tas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, class: taClass } = req.body;

    const updated = await TA.findByIdAndUpdate(
      id,
      { name, email, class: taClass },
    );

    if (!updated) {
      return res.status(404).send("TA not found.");
    }

    const ta = await TA.findById(id);
    res.status(200).json(mapTaRecord(ta));
  } catch (err) {
    console.error("Error updating TA:", err);
    res.status(500).send("Error updating TA.");
  }
});


// Delete a TA
app.delete("/tas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await TA.deleteOne({ _id: id });
    if (!deleted) {
      return res.status(404).send("No TA found with that ID.");
    }
    res.status(200).send("TA deleted successfully!");
  } catch (err) {
    console.error("Error deleting TA:", err);
    res.status(500).send("Error deleting TA");
  }
});


// Auth: login (made null-safe & async)
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = await User.findUserByEmail(email);
    if (!user) return res.status(404).send({ message: "Email not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).send({ message: "Password does not match" });

    const token = jwt.sign(
      {
        userId: user.id,
        userEmail: user.email,
        isTa: user.isTa,
        isAdmin: !!user.isAdmin
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).send({
      message: "Login Successful",
      email: user.email,
      name: user.name ?? user.full_name ?? user.username ?? "",
      jwt: token,
      isTa: user.isTa,
      isAdmin: user.isAdmin
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: "Server error" });
  }
});

// Auth: register
app.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body || {};

    const taExists = await TA.findTaByEmail(email);
    const isTa = !!taExists;

    const userId = await User.createUser(email, password, name, isTa, false);

    const token = jwt.sign(
      { userId: userId, userEmail: email, isTa: isTa },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
    const createdUser = await User.findUserByEmail(email);
    res.status(200).send({
      jwt: token,
      email: email,
      name: createdUser?.name ?? name,
      isTa
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error registering new user, please try again.");
  }
});

// Cards
app.post("/card", async (req, res) => {
  try {
    const cardData = req.body?.data;
    let storedData = null;
    let contentType = 'image/gif';

    if (typeof cardData === "string") {
      const match = cardData.match(/^data:(.+);base64,(.+)$/);
      if (match) {
        contentType = match[1];
        storedData = Buffer.from(match[2], "base64");
      } else {
        storedData = Buffer.from(cardData, "base64");
      }
    } else if (cardData instanceof Buffer) {
      storedData = cardData;
    }

    if (!storedData) {
      return res.status(400).send("Card payload missing or invalid.");
    }

    const newCard = {
      data: storedData,
      forEmail: req.body?.forEmail,
      fromName: req.body?.fromName,
      fromClass: req.body?.fromClass,
      contentType,
    };
    await Card.save(newCard);

    // Send email notification to the TA
    const taEmail = req.body?.forEmail;
    const fromName = req.body?.fromName;
    const fromClass = req.body?.fromClass;

    if (taEmail) {
      const subject = "You've received a Thank-A-TA card!";
      const text = `Dear TA,

      You have received a new Thank-A-TA card from ${fromName} (${fromClass}).

      View your card here: ${FRONTEND_BASE_URL}/login

      Thank you for your hard work!

      Sincerely,
      The Thank-A-TA Team`;
            const html = `<p>Dear TA,</p>
      <p>You have received a new Thank-A-TA card from <strong>${fromName}</strong> (<strong>${fromClass}</strong>).</p>
      <p>View your card here: <a href="${FRONTEND_BASE_URL}/login">${FRONTEND_BASE_URL}/login</a></p>
      <p>Thank you for your hard work!</p>
      <p>Sincerely,<br>The Thank-A-TA Team</p>`;

      try {
        await sendEmail(taEmail, subject, text, html);
        console.log(`Email sent to ${taEmail}`);
      } catch (emailError) {
        console.error(`Failed to send email to ${taEmail}:`, emailError);
      }
    }

    res.status(200).send({ ok: true });
  } catch (err) {
    console.error("Error saving card:", err);
    res.status(500).send("Error saving card");
  }
});

app.get("/", async (_req, res) => {
  try {
    const enabledSemesters = await Semester.find({ isEnabled: true });
    const semesterNames = enabledSemesters.map((semester) => semester.semester);

    let tas = [];
    if (semesterNames.length > 0) {
      tas = await TA.findBySemesters(semesterNames);
    }

    res.set("Access-Control-Allow-Origin", "*");
    res.json(tas.map(mapTaRecord));
  } catch (e) {
    console.error(e);
    res.status(500).send("Error");
  }
});

app.get("/cards/:taId", async (req, res) => {
  try {
    const { taId } = req.params;
    console.log(`Fetching cards for TA email: ${taId}`);
    const taCards = await Card.find({ forEmail: taId });
    console.log(`Found ${taCards.length} cards.`);
    res.json(taCards.map((card) => mapCardRecord(card)));
  } catch (err) {
    console.error("Error fetching cards:", err);
    res.status(500).send("Error fetching cards");
  }
});

// GIFs
app.post("/upload-gif", upload.single("gif"), async (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded.");
  if (req.file.mimetype !== "image/gif") return res.status(400).send("Only GIF files are allowed.");

  try {
    const uploadedBy = req.user?.userEmail || "admin@example.com";
    const newGif = {
      name: req.file.originalname,
      data: req.file.buffer,
      contentType: req.file.mimetype,
      size: req.file.size,
      uploadedBy
    };
    await GIF.save(newGif);
    res.status(200).send("GIF uploaded and saved successfully!");
  } catch (error) {
    console.error("Error saving GIF:", error);
    res.status(500).send("Error saving GIF to the database.");
  }
});

app.get("/get-gifs", async (_req, res) => {
  try {
    const gifs = await GIF.find();
    if (!gifs || gifs.length === 0) return res.status(404).send("No GIFs found");
    res.json(gifs.map((gif) => ({ name: gif.name, _id: gif.id })));
  } catch (err) {
    console.error("Error retrieving GIFs:", err);
    res.status(500).send("Error retrieving GIFs");
  }
});

app.get("/get-gif/:id", async (req, res) => {
  try {
    const gif = await GIF.findById(req.params.id);
    if (!gif) return res.status(404).send("GIF not found");
    res.set("Content-Type", gif.contentType);
    res.send(gif.data);
  } catch (err) {
    console.error("Error retrieving GIF:", err);
    res.status(500).send("Error retrieving GIF");
  }
});

app.delete("/delete-gif/:id", async (req, res) => {
  try {
    const deletedGif = await GIF.findByIdAndDelete(req.params.id);
    if (!deletedGif) return res.status(404).send({ message: `GIF with ID ${req.params.id} not found` });
    res.status(200).send({ message: "GIF deleted successfully" });
  } catch (error) {
    console.error("Error deleting GIF:", error);
    res.status(500).send({ message: "Server error" });
  }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build/index.html'));
});

// ---- STARTUP ----
async function start() {
  app.listen(PORT, () => console.log(`API listening on ${PORT}`));
}

if (require.main === module) {
  // Only start the server if this file is run directly
  start().catch((e) => {
    console.error("Startup error:", e);
    process.exit(1);
  });
}

// Export the app for Passenger/Tests
module.exports = app;
