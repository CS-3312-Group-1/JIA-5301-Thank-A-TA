const http = require('node:http');
const {MongoClient} = require('mongodb');
const express = require("express");
const cors = require('cors');
const bcrypt = require("bcrypt");
const User = require("./db/userModel");
const app = express();
const jwt = require("jsonwebtoken");


const corsOptions ={
    origin:'http://localhost:3000', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
app.use(cors(corsOptions));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});
app.use(express.json());
const port = 3001;

const uri = "mongodb+srv://vhenrixon:QQVTMsoHD2EqzdoC@cluster0.ayl3tmp.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

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
            },
            "RANDOM-TOKEN",
            { expiresIn: "24h" }
          );

          //   return success response
          response.status(200).send({
            message: "Login Successful",
            email: user.email,
            token,
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

app.post("/register", (request, response) => {
  bcrypt.hash(request.body.password, 10)
  .then((hashedPassword) => {
    const user = new User({
      email: request.body.email,
      password: hashedPassword,
    });
})
  .catch((e) => {
    response.status(500).send({
      message: "Password was not hashed successfully",
      e,
    });
  });
  user.save().then((result) => {
    response.status(201).send({
      message: "User Created Successfully",
      result,
    });
  })
  .catch((error) => {
    response.status(500).send({
      message: "Error creating user",
      error,
    });
  });
})
app.post('/card', async (req, res) => {
  try {
    var card = {
      img: req.body.img,
      text: req.body.text,
    };
    const database = client.db("thank-a-teacher");
    const cards = database.collection("CARD");
    cards.insertOne(card, function (err, result) {
      assert.equal(null, err);
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
    const taCards = await cards.find({ taId: taId }).toArray();
    res.json(taCards);
  } catch (err) {
    console.error('Error fetching cards:', err);
    res.status(500).send('Error fetching cards');
  }
});


app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});