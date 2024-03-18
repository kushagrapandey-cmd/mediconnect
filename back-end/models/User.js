const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String
  },
  gender: {
    type: String
  },
  uniqueCode: {
    type: String,
    required: true
  },
  // Define field for uploaded files
  uploadedFiles: [
    {
     
      filename: {
        type: String,
        required: true
      }
      
    }
  ]
});

const User = mongoose.model("User", userSchema, "users");

module.exports = User;
