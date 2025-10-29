const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
  semester: { type: String, required: true, unique: true },
  fileRef: { type: String, required: true },
  isEnabled: { type: Boolean, default: true },
});

module.exports = mongoose.model('Semester', semesterSchema);
