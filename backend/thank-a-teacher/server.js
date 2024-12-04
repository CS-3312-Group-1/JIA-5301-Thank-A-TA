const http = require('node:http');
const {MongoClient} = require('mongodb');
const express = require("express");
const cors = require('cors');
const bcrypt = require("bcrypt");
const User = require("./db/userModel");
const app = express();
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const GIF = require("./db/GIFmodel2");


const multer = require('multer');
const storage = multer.memoryStorage(); // Store files in memory buffer
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB limit
});


const corsOptions ={
    origin:'http://localhost:3000', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
app.use(cors(corsOptions));
app.use(express.json({limit: '50mb'}));
//app.use(express.bodyParser({limit: '50mb'}));
const port = 3001;

const uri = "mongodb+srv://vhenrixon:QQVTMsoHD2EqzdoC@cluster0.ayl3tmp.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);
mongoose 
 .connect(uri)   
 .then(() => console.log("Database connected!"))
 .catch(err => console.log(err));
list = {}
async function populate_ta(){

    const database = client.db("thank-a-teacher");
    const ta = database.collection("TA");

    const ta_list = ta.find();
    i = 0
    for await (const doc of ta_list) {
      list[i] = doc
      i++
    }
}


populate_ta().catch(console.error);

// login endpoint

app.post("/login", (request, response) => {
  console.log(request.body.email)
  // check if email exists
  User.findOne({ email: request.body.email })

    // if email exists
    .then((user) => {
      // compare the password entered and the hashed password found
      bcrypt
        .compare(request.body.password, user.password)

        // if the passwords match
        .then((passwordCheck) => {

          // check if password matches
          if(!passwordCheck) {
            return response.status(400).send({
              message: "Passwords does not match",
              error,
            });
          }

          //   create JWT token
          const token = jwt.sign(
            {
              userId: user._id,
              userEmail: user.email,
              isTa: user.isTa,
              isAdmin: user.isAdmin | false 
            },
            "RANDOM-TOKEN",
            { expiresIn: "24h" }
          );

          //   return success response
          response.status(200).send({
            message: "Login Successful",
            email: user.email,
            jwt: token,
            isTa: user.isTa
          });
        })
        // catch error if password does not match
        .catch((error) => {
          response.status(400).send({
            message: "Passwords does not match",
            error,
          });
        });
    })
    // catch error if email does not exist
    .catch((e) => {
      response.status(404).send({
        message: "Email not found",
        e,
      });
    });
});

app.post("/upload-gif", upload.single('gif'), async (req, res) => {
  if (!req.file) {
      return res.status(400).send('No file uploaded.');
  }

  if (req.file.mimetype !== 'image/gif') {
      return res.status(400).send('Only GIF files are allowed.');
  }

  try {
      const newGif = new GIF({
          name: req.file.originalname,
          img: {
              data: req.file.buffer,
              contentType: req.file.mimetype
          },
          size: req.file.size,
          uploadedBy: "admin@example.com" // Replace with actual uploader info if needed
      });

      await newGif.save();
      res.status(200).send('GIF uploaded and saved successfully!');
  } catch (error) {
      console.error('Error saving GIF:', error);
      res.status(500).send('Error saving GIF to the database.');
  }
});

app.get("/gifs", async (req, res) => {
  try {
      const database = client.db("test");
      const gifsCollection = database.collection("gif2"); 

      // Fetch all GIFs from the collection
      const gifs = await gifsCollection.find().toArray();

      // Convert each GIF to Base64 format
      const processedGifs = gifs.map((gif) => ({
          id: gif._id,
          name: gif.name,
          size: gif.size,
          uploadedBy: gif.uploadedBy,
          dataUrl: `data:${gif.img.contentType};base64,${gif.img.data.toString("base64")}`
      }));

      res.status(200).json({ gifs: processedGifs });
  } catch (error) {
      console.error("Error fetching GIFs:", error);
      res.status(500).send("Error fetching GIFs from the database.");
  }
});

app.post("/register", (req, res) => {
    const { email, password, fullname ,isTa } = req.body;
    const user = new User({ email, password, isTa, fullname, "isAdmin": false});
    user.save().then(function() {
      const token = jwt.sign(
        {
          userId: user._id,
          userEmail: user.email,
          isTa: user.isTa
        },
        "RANDOM-TOKEN",
        { expiresIn: "24h" }
      );
      res.status(200).send({jwt: token, email: user.email, isTa: isTa});
    }).catch(function(err) {
      console.log(err)
      res.status(500)
      .send("Error registering new user please try again.");
    })
});
app.post('/card', async (req, res) => {
  console.log("Received request to /card", req.body);
  try {
    console.log(req.body)
    var card = {
      data: req.body.data,
      for: req.body.for,
    };
    const database = client.db("thank-a-teacher");
    const cards = database.collection("CARD");
    cards.insertOne(card, function (err, result) {
     
      console.log('item has been inserted');
    }) 

  } catch (err) {
      console.error('Error saving user data:', err);
      res.status(500);
  }
});

app.get("/", function (req, res) {
  res.set('Access-Control-Allow-Origin', '*');
  populate_ta()
  res.json(list);
});

app.get('/cards/:taId', async (req, res) => {
  const { taId } = req.params;
  try {
    const database = client.db("thank-a-teacher");
    const cards = database.collection("CARD");
    // Match the field name to what is saved in the database
    const taCards = await cards.find({ for: taId }).toArray();
    res.json(taCards);
  } catch (err) {
    console.error('Error fetching cards:', err);
    res.status(500).send('Error fetching cards');
  }
});



app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});
