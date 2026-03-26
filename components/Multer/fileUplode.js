const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");

const storage = new GridFsStorage({
  url: "mongodb+srv://Kutty:LouisMuthusamy@skill-swap-pro.pdlbycu.mongodb.net/?appName=Skill-Swap-pro",
  file: (req, file) => {
    return {
      filename: Date.now() + "-" + file.originalname,
      bucketName: "uploads",
    };
  },
});

const upload = multer({ storage });

module.exports = upload;