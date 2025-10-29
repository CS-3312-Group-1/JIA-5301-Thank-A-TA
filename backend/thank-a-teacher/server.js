// server.js
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const multer = require("multer");
const csv = require("csv-parser");
const stream = require("stream");
// required for SSO/CAS auth
const session = require('express-session');
const CASAuthentication = require('express-cas-authentication');

require('dotenv').config();

// MODELS
const User = require("./db/userModel");
const GIF = require("./db/GIFmodel2");
const Semester = require("./db/semesterModel");
const TA = require("./db/taModel");
const Card = require("./db/cardModel"); // Import the new Card model

// ---- CONFIG ----
const app = express();
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

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
  service_url: process.env.SITE_URL | '',
  cas_version: '3.0',
  session_info: "cas_userinfo",
});

// Body parsing
app.use(express.json({ limit: "50mb" }));

// ---- DB INIT ----
async function initDbs() {
  await mongoose.connect(MONGO_URI);
  console.log("Mongoose connected");
}

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

        const taDocs = results.map((ta) => ({
          name: `${ta.FirstName} ${ta.LastName}`.trim(),
          email: ta["Email"],
          class: ta.Class,
          semester: semesterName,
          ref: req.file.originalname,
        }));

        await TA.insertMany(taDocs);

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
    const semesters = await Semester.find({});
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
    res.status(200).json({ _id: ta._id });
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
    res.json(tas);
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

    const newTa = new TA({
      name,
      email,
      class: taClass,
      semester,
      ref: "personal add",
    });

    await newTa.save();

    res.status(200).send("TA added successfully!");
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

    const updatedTa = await TA.findByIdAndUpdate(
      id,
      { name, email, class: taClass },
      { new: true }
    );

    if (!updatedTa) {
      return res.status(404).send("TA not found.");
    }

    res.status(200).json(updatedTa);
  } catch (err) {
    console.error("Error updating TA:", err);
    res.status(500).send("Error updating TA.");
  }
});


// Delete a TA
app.delete("/tas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await TA.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
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
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send({ message: "Email not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).send({ message: "Password does not match" });

    const token = jwt.sign(
      {
        userId: user._id,
        userEmail: user.email,
        isTa: user.isTa,
        isAdmin: !!user.isAdmin
      },
      "RANDOM-TOKEN",
      { expiresIn: "24h" }
    );

    res.status(200).send({
      message: "Login Successful",
      email: user.email,
      name: user.name,
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
    
    const taExists = await TA.findOne({ email });
    const isTa = !!taExists; 

    const user = await User.create({ email, password, name, isTa, isAdmin: false });

    const token = jwt.sign(
      { userId: user._id, userEmail: user.email, isTa: user.isTa },
      "RANDOM-TOKEN",
      { expiresIn: "24h" }
    );
    res.status(200).send({ jwt: token, email: user.email, isTa });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error registering new user, please try again.");
  }
});

// Cards
app.post("/card", async (req, res) => {
  try {
    const newCard = new Card({
      data: req.body?.data,
      for: req.body?.for,
      fromName: req.body?.fromName,
      fromClass: req.body?.fromClass
    });
    await newCard.save();
    res.status(200).send({ ok: true });
  } catch (err) {
    console.error("Error saving card:", err);
    res.status(500).send("Error saving card");
  }
});

app.get("/", async (_req, res) => {
  try {
    const tas = await TA.find({ isEnabled: true });
    res.set("Access-Control-Allow-Origin", "*");
    res.json(tas);
  } catch (e) {
    console.error(e);
    res.status(500).send("Error");
  }
});

app.get("/cards/:taId", async (req, res) => {
  try {
    const { taId } = req.params;
    console.log(`Fetching cards for taId (email): ${taId}`);
    const taCards = await Card.find({ for: taId });
    console.log(`Found ${taCards.length} cards.`);
    res.json(taCards);
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
    const newGif = new GIF({
      name: req.file.originalname,
      img: { data: req.file.buffer, contentType: req.file.mimetype },
      size: req.file.size,
      uploadedBy: "admin@example.com"
    });
    await newGif.save();
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
    res.json(gifs.map((gif) => ({ name: gif.name, _id: gif._id })));
  } catch (err) {
    console.error("Error retrieving GIFs:", err);
    res.status(500).send("Error retrieving GIFs");
  }
});

app.get("/get-gif/:id", async (req, res) => {
  try {
    const gif = await GIF.findById(req.params.id);
    if (!gif) return res.status(404).send("GIF not found");
    res.set("Content-Type", gif.img.contentType);
    res.send(gif.img.data);
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

// ---- STARTUP ----
async function start() {
  await initDbs();
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
