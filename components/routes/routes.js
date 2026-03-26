const express = require("express");
const router = express.Router();
const upload = require("./fileUpload");

router.post("/upload", upload.single("file"), (req, res) => {
  res.json({ file: req.file });
});

module.exports = router;