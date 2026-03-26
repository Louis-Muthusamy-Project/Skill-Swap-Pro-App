const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  CoursHolder: String,
  filename: String,
  originalname: String,
  mimetype: String,
  size: Number,
  path: String,
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("File", fileSchema);