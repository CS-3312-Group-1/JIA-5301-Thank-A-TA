const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Please provide an Email!"],
        unique: [true, "Email Exist"],
      },
    
      password: {
        type: String,
        required: [true, "Please provide a password!"],
        unique: false,
      },
      isTa: {
        type: Boolean,
        required: [true, "Please provide TA status"],
        unique: false,
      },
      name: {
        type: String, 
        required: [false, "Please provide your name"],
        unique: false 
      },
      isAdmin: {
        type: Boolean,
        required: [false, "Please provide TA status"],
        unique: false,
      },
})
UserSchema.pre('save', function(next) {
  console.log("saving")
  // Check if document is new or a new password has been set
  if (this.isNew || this.isModified('password')) {
    // Saving reference to this because of changing scopes
    const document = this;
    bcrypt.hash(document.password, 10,
      function(err, hashedPassword) {
      if (err) {
        next(err);
      }
      else {
        document.password = hashedPassword;
        next();
      }
    });
  } else {
    next();
  }
});





module.exports = mongoose.model('User', UserSchema);