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
const port = 3001;

const uri = "mongodb+srv://vhenrixon:QQVTMsoHD2EqzdoC@cluster0.ayl3tmp.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);
list = {}
async function main(){

    const database = client.db("thank-a-teacher");
    const ta = database.collection("TA");

    const ta_list = ta.find();
    i = 0
    for await (const doc of ta_list) {
      list[i] = doc
      i++
    }
}


main().catch(console.error);


app.get("/", function (req, res) {
  res.set('Access-Control-Allow-Origin', '*');
  res.json(list);
});

app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});