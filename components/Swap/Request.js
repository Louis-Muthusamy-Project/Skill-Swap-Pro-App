const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  from: String,
  to: String,
  title: String,
  status: { type: String, default: "pending" }
});

module.exports = mongoose.model("Request", requestSchema);