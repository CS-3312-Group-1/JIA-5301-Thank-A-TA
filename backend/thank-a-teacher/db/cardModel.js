const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  data: { type: String, required: true },
  for: { type: String, required: true }, // Storing email as per user's example
  fromName: { type: String },
  fromClass: { type: String },
});

module.exports = mongoose.model('CARD', cardSchema);
