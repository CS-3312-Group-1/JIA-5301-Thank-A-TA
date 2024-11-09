const http = require('node:http');
const {MongoClient} = require('mongodb');
const express = require("express");
const cors = require('cors');

const app = express();

const corsOptions ={
    origin:'http://localhost:3000', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
app.use(cors(corsOptions));
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

app.post('/card', async (req, res) => {
  console.log(req.body)
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