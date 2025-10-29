const mongoose = require('mongoose');

const taSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  class: { type: String },
  semester: { type: String, required: true },
  ref: { type: String },
});

module.exports = mongoose.model('TA', taSchema);
