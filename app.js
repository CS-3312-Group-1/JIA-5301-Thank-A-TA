// app.js - Main application entry point
require('dotenv').config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const stream = require("stream");
const path = require("path");
const csv = require("csv-parser");
const GIF = require("./db/gifModel");
const Semester = require("./db/semesterModel");
const TA = require("./db/taModel");
const Card = require("./db/cardModel");
const { sendEmail } = require('./email');

// Session and authentication
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

// Import routes and middleware
const authRoutes = require('./routes/auth');
const { requireAuth, requireTA, requireAdmin } = require('./middleware/requireAuth');

const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:3000'; // Define frontend URL


// ---- CONFIG ----
const app = express();
const PORT = process.env.PORT;

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required.");
}

// CAS session/proxy setup
app.set('trust proxy', 1);

// MySQL session store configuration
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  clearExpired: true,
  checkExpirationInterval: 900000, // 15 minutes
  expiration: 86400000, // 24 hours
  createDatabaseTable: true,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
});

app.use(session({
  key: 'ta_session',
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 86400000, // 24 hours
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
}));

// CORS - Allow credentials for session cookies
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_BASE_URL, process.env.SITE_URL].filter(Boolean)
    : 'http://localhost:3000',
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Middleware to handle CAS authentication from Apache mod_auth_cas
async function casAuthMiddleware(req, res, next) {
  // Apache mod_auth_cas sets REMOTE_USER header after successful authentication
  const casUser = req.headers['remote-user'] || req.headers['x-remote-user'];

  if (casUser && !req.session.user) {
    try {
      // Check if user is a TA
      const taRecord = await TA.findOne({ email: casUser });
      const isTa = !!taRecord;

      // Create session (no database storage needed)
      req.session.user = {
        userEmail: casUser,
        userName: casUser.split('@')[0], // Use email prefix as name
        isTa: isTa,
        isAdmin: false // Set manually for admin users
      };

      await req.session.save();
    } catch (error) {
      console.error('Error creating CAS session:', error);
    }
  }

  next();
}

// Apply CAS auth middleware to all routes
app.use(casAuthMiddleware);

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

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Mount authentication routes (session-based)
app.use('/api', authRoutes);

// ---- UPLOADS (multer) ----
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ---- ROUTES ----

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    // Redirect to CAS logout
    res.redirect('https://login.gatech.edu/cas/logout');
  });
});

// ---- API ROUTES ----
// All API routes are prefixed with /api

// Health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Upload TAs via CSV (Admin only)
app.post("/api/upload-tas", requireAuth, requireAdmin, upload.single("csv"), (req, res) => {
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

// Get all semesters (Admin only)
app.get("/api/semesters", requireAuth, requireAdmin, async (req, res) => {
  try {
    const semesters = await Semester.find();
    res.json(semesters);
  } catch (err) {
    console.error("Error fetching semesters:", err);
    res.status(500).send("Error fetching semesters");
  }
});

// Get enabled semesters
app.get("/api/semesters/enabled", async (req, res) => {
  try {
    const semesters = await Semester.find({ isEnabled: true });
    res.json(semesters);
  } catch (err) {
    console.error("Error fetching enabled semesters:", err);
    res.status(500).send("Error fetching enabled semesters");
  }
});


// Delete a semester and all associated TAs (Admin only)
app.delete("/api/semesters/:id", requireAuth, requireAdmin, async (req, res) => {
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

// Toggle a semester's isEnabled status (Admin only)
app.patch("/api/semesters/:id/toggle", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const semester = await Semester.findById(id);
    if (!semester) {
      return res.status(404).send("No semester found with that ID.");
    }
    const newIsEnabled = !semester.isEnabled;
    const updatedSemester = await Semester.updateOne(
      { _id: id },
      { $set: { isEnabled: newIsEnabled } }
    );

    if (!updatedSemester) {
      return res.status(500).send("Failed to update semester.");
    }

    res.status(200).json({
      message: `Semester ${newIsEnabled ? 'enabled' : 'disabled'} successfully!`,
      semester: updatedSemester,
      isEnabled: newIsEnabled
    });
  } catch (err) {
    console.error("Error toggling semester:", err);
    res.status(500).send("Error toggling semester");
  }
});

app.get("/api/ta/id/:email", async (req, res) => {
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
app.get("/api/tas/:semester", async (req, res) => {
  try {
    const { semester } = req.params;
    const tas = await TA.find({ semester: semester });
    res.json(tas.map(mapTaRecord));
  } catch (err) {
    console.error("Error fetching TAs:", err);
    res.status(500).send("Error fetching TAs");
  }
});

// Add a TA to a semester (personal add) (Admin only)
app.post("/api/tas/:semester", requireAuth, requireAdmin, async (req, res) => {
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

// Update a TA (Admin only)
app.put("/api/tas/:id", requireAuth, requireAdmin, async (req, res) => {
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


// Delete a TA (Admin only)
app.delete("/api/tas/:id", requireAuth, requireAdmin, async (req, res) => {
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


// Authentication routes are now handled by routes/auth.js (session-based)

// const Filter = require('bad-words');
// const filter = new Filter();

// Cards
app.post("/api/card", async (req, res) => {
  try {
    const { text_content } = req.body;

    // if (text_content && text_content.some(text => filter.isProfane(text))) {
    //   return res.status(400).send({ message: "Your message contains inappropriate language and could not be sent." });
    // }

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
      fromSemester: req.body?.fromSemester,
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

// Get all TAs from enabled semesters
app.get("/api/tas-enabled", async (_req, res) => {
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

// Get cards for a TA (requires authentication - TAs can only see their own)
app.get("/api/cards/:taId", requireAuth, requireTA, async (req, res) => {
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

// GIFs (Admin only for upload)
app.post("/api/upload-gif", requireAuth, requireAdmin, upload.single("gif"), async (req, res) => {
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

app.get("/api/get-gifs", async (_req, res) => {
  try {
    const gifs = await GIF.find();
    if (!gifs || gifs.length === 0) return res.status(404).send("No GIFs found");
    res.json(gifs.map((gif) => ({ name: gif.name, _id: gif.id })));
  } catch (err) {
    console.error("Error retrieving GIFs:", err);
    res.status(500).send("Error retrieving GIFs");
  }
});

app.get("/api/get-gif/:id", async (req, res) => {
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

app.delete("/api/delete-gif/:id", requireAuth, requireAdmin, async (req, res) => {
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
// Start the server - Passenger and direct execution both need this
const port = PORT || 3001;
app.listen(port, () => {
  console.log(`API listening on ${port}`);
});

// Export the app for Passenger/Tests
module.exports = app;
