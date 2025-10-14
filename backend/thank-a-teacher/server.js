// server.js
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");
const multer = require("multer");
const csv = require("csv-parser");
const stream = require("stream");

require('dotenv').config();

// MODELS
const User = require("./db/userModel");
const GIF = require("./db/GIFmodel2");

// ---- CONFIG ----
const app = express();
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

// CORS
app.use(cors({
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Body parsing
app.use(express.json({ limit: "50mb" }));

// ---- DB INIT ----
let client;                                         // native Mongo client (used for TA/CARD collections)
let list = {};

async function initDbs() {
  // Mongoose (used by Mongoose models: User, GIF)
  await mongoose.connect(MONGO_URI);
  console.log("Mongoose connected");

  // Native client (used by populate_ta / CARD endpoints)
  client = new MongoClient(MONGO_URI);
  await client.connect();                           // ★ you were missing this
  console.log("MongoClient connected");

  await populate_ta();
}

async function populate_ta() {
  const database = client.db("thank-a-teacher");
  const ta = database.collection("TA");
  const cursor = ta.find({ $or: [{ isEnabled: true }, { isEnabled: { $exists: false } }] });
  const tmp = {};
  let i = 0;
  for await (const doc of cursor) {
    tmp[i++] = doc;
  }
  list = tmp;
}

// ---- UPLOADS (multer) ----
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ---- ROUTES ----

// Health
app.get("/health", (_req, res) => res.json({ ok: true }));

// Upload TAs via CSV
app.post("/upload-tas", upload.single("csv"), (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded.");

  const bufferStream = new stream.PassThrough();
  bufferStream.end(req.file.buffer);

  const results = [];
  let semester = null;

  bufferStream
    .pipe(csv())
    .on("data", (data) => {
      if (!semester) {
        semester = data.Semester;
      }
      results.push(data);
    })
    .on("end", async () => {
      if (!semester) {
        return res.status(400).send("CSV must have a 'Semester' column.");
      }

      try {
        const database = client.db("thank-a-teacher");
        const taCollection = database.collection("TA");
        await taCollection.updateOne(
          { semester },
          { $set: { 
              data: results.map((ta) => ({ name: ta["Name"], email: ta.Email, class: ta.Class })),
              filename: req.file.originalname,
              isEnabled: true
            }
          },
          { upsert: true }
        );
        res.status(200).send("TA data uploaded successfully!");
      } catch (err) {
        console.error(err);
        res.status(500).send("Error saving TA data.");
      }
    });
});

app.get("/tas", async (req, res) => {
  try {
    const database = client.db("thank-a-teacher");
    const taCollection = database.collection("TA");
    const tas = await taCollection.find({}, { projection: { semester: 1, filename: 1, isEnabled: 1 } }).toArray();
    res.json(tas);
  } catch (err) {
    console.error("Error fetching TA lists:", err);
    res.status(500).send("Error fetching TA lists");
  }
});

app.delete("/tas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const database = client.db("thank-a-teacher");
    const taCollection = database.collection("TA");
    const result = await taCollection.deleteOne({ _id: new mongoose.Types.ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).send("No TA list found with that ID.");
    }
    res.status(200).send("TA list deleted successfully!");
  } catch (err) {
    console.error("Error deleting TA list:", err);
    res.status(500).send("Error deleting TA list");
  }
});

app.patch("/tas/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;
    const database = client.db("thank-a-teacher");
    const taCollection = database.collection("TA");
    const taList = await taCollection.findOne({ _id: new mongoose.Types.ObjectId(id) });
    if (!taList) {
      return res.status(404).send("No TA list found with that ID.");
    }
    const newIsEnabled = !taList.isEnabled;
    await taCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: { isEnabled: newIsEnabled } }
    );
    res.status(200).send(`TA list ${newIsEnabled ? 'enabled' : 'disabled'} successfully!`);
  } catch (err) {
    console.error("Error toggling TA list:", err);
    res.status(500).send("Error toggling TA list");
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
    const { email, password, name, isTa } = req.body || {};
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
    const database = client.db("thank-a-teacher");
    const cards = database.collection("CARD");
    const doc = {
      data: req.body?.data,
      for: req.body?.for,
      fromName: req.body?.fromName,
      fromClass: req.body?.fromClass
    };
    await cards.insertOne(doc);
    res.status(200).send({ ok: true });
  } catch (err) {
    console.error("Error saving card:", err);
    res.status(500).send("Error saving card");
  }
});

app.get("/", async (_req, res) => {
  try {
    await populate_ta();                             // refresh cache
    res.set("Access-Control-Allow-Origin", "*");
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).send("Error");
  }
});

app.get("/cards/:taId", async (req, res) => {
  try {
    const { taId } = req.params;
    const database = client.db("thank-a-teacher");
    const cards = database.collection("CARD");
    const taCards = await cards.find({ for: taId }).toArray();
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