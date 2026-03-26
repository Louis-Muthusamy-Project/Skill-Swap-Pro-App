import dotenv from "dotenv";
dotenv.config();
import express from 'express';
import cors from "cors";
import mongoose from "mongoose";
import connectDB from "./components/DB/ConnectDb.js"
import bcrypt from 'bcrypt';
import bodyParser from "body-parser";
import multer from "multer";
import fs from "fs";
import File from "./components/DB/File.js";
import Request from "./components/Swap/Request.js";

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

connectDB();

const dbs = new mongoose.Schema({
  userId: String,
  userName: String,
  userPassword: String
})
const Data = mongoose.model('Login Data', dbs)

app.post("/Signup", async (req, res) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

  const name = req.body.name
  const id = 1
  const find = await Data.findOne({ userName: name })
  if (!find) {
    const newData = new Data({ userId: id, userName: name, userPassword: hashedPassword })
    newData.save()

      .then(() => {
        res.send({ message: "Login Successfully" });
      })
      .catch((err) => {
        res.send(err);
      })
  }
  else {
    res.send({ message: "User is Aldredy Exists" });
  }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/Login", async (req, res) => {
  const { name, password } = req.body;

  const User = await Data.findOne({ userName: name })
  const UserPass = User.userPassword
  try {
    const isMatch = await bcrypt.compare(password, UserPass)

    if (isMatch) {
      res.status(200).json(User)
    } else {
      res.status(404).send({ message: "User Not Found" })
    }
  } catch (err) {
    console.log(err)
  }
});

const Profile = new mongoose.Schema({ UserName: String, SkillWant: String, SkillOffer: String, ProfileUrl: String, SkillLevel: String })
const Pdata = mongoose.model('Profile_Data', Profile)

app.post('/profile', async (req, res) => {
  const name = req.body.name
  const skillOffer = req.body.skillOff
  const skillWant = req.body.skillWant
  const skillLevel = req.body.Slevel

  const find = await Pdata.findOne({ UserName: name })
  if (!find) {
    const profile = new Pdata({ UserName: name, SkillWant: skillWant, SkillOffer: skillOffer, SkillLevel: skillLevel })
    profile.save()
      .then(() => {
        res.send({ message: "ADD" })
      })
      .catch((err) => {
        console.log(err)
      })
  } else {
    res.status(200).send("Exist")
  }
});

app.post('/getProfile', async (req, res) => {
  const name = req.body.name
  const profile = await Pdata.findOne({ UserName: name });
  if (profile) {
    res.status(200).json(profile)
  } else {
    res.status(200).send({ message: "ila" })
  }
});

app.get('/usergetdata', async (req, res) => {
  const profile = await Pdata.find();
  if (profile) {
    res.status(200).json(profile)
  }
});
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = [
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/pdf"
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  }
});

app.post("/api/files", upload.single("file"), async (req, res) => {
  try {
    const newFile = new File({ ...req.file, CoursHolder: req.body.user });
    await newFile.save();
    res.status(201).json(newFile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/files/:id", async (req, res) => {
  try {
    const name = req.params.id
    console.log(name)
    const files = await File.find({ CoursHolder: name }).sort({ uploadedAt: -1 });
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/files/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });

    fs.unlinkSync(file.path);

    await File.findByIdAndDelete(req.params.id);

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/allFiles", async (req, res) => {
  const allfiles = await File.find();
  console.log(allfiles)
  if (allfiles) {
    res.status(200).json(allfiles);
  }
  else {
    res.status(404).send({ message: "File not Found" });
  }
});

app.post("/send-request", async (req, res) => {
  const { fromName, toName, title } = req.body;
  const RequestData = await Request({ from: fromName, to: toName, title: title })
  RequestData.save();
});

app.get("/fetchRequest/:id", async (req, res) => {
  const name = req.params.id
  const requestData = await Request.find({ to: name });
  res.status(200).json(requestData);
});

app.post("/accept-request", async (req, res) => {
  const { from, to, _id } = req.body
  const originalUser = await File.findOne({ CoursHolder: from });
  const requestcheck = await Request.find({ _id: _id });
  console.log(requestcheck, _id)
  if (requestcheck[0].status === "pending") {
    try {
      if (!originalUser) return res.status(404).json({ message: "User not found" });
      const swapUser = new File({
        ...originalUser.toObject(),
        CoursHolder: to
      });
      swapUser._id = undefined;
      await swapUser.save();
      const ReqState = await Request.findOneAndUpdate({ _id: _id }, { $set: { status: "Accepted" } });
      res.status(200).send({ message: "Accepted" })
    }
    catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
  else {
    res.status(200).send({ message: "The Request is accept or Reject" });
  }
});

app.post("/reject-request/:id", async (req, res) => {
  const requestcheck = await Request.findByIdAndUpdate(req.params.id, { $set: { status: "Rejected" } });
  res.status(200).send({ message: "Rejected" });
});

app.listen(PORT, () => {
  console.log("Run Aguthu")
})