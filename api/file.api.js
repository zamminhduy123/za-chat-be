const express = require("express");
const router = express.Router();
const fs = require("fs");

const { statusCode } = require("../constant");

const multer = require("multer");

const imageFileHandler = require("../helper/imageFileHandler");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); //Appending extension
  },
});

const upload = multer({ storage: storage });
const path = require("path");

router.post("/", upload.single("file"), async (req, res) => {
  const file = req.file;
  if (!file) res.sendStatus(statusCode.BAD_REQUEST);
  let uploadResult;
  const pathToFile = path.join(__dirname, "../uploads/", file.filename);
  console.log(file);
  try {
    uploadResult = file
      ? await imageFileHandler.saveToCloudinary(pathToFile, file.mimetype)
      : null;
    res.status(statusCode.SUCCESS).send(uploadResult.url);
  } catch (err) {
    console.log("err uploading image to cloudinary");
    res.status(statusCode.SERVER_ERROR).send(err);
  } finally {
    fs.unlinkSync(pathToFile);
  }
});

router.post("/chunkUpload", async (req, res) => {
  const { name, currentChunkIndex, totalChunks } = req.query;
  const firstChunk = parseInt(currentChunkIndex) === 0;
  const lastChunk = parseInt(currentChunkIndex) === parseInt(totalChunks) - 1;
  const data = req.body.toString().split(",")[1];
  const buffer = new Buffer.from(data, "base64");

  const pathToFile = path.join(__dirname, "../uploads/", name);
  if (firstChunk && fs.existsSync(pathToFile)) {
    fs.unlinkSync(pathToFile);
  }
  fs.appendFileSync(pathToFile, buffer);
  if (lastChunk) {
    //get and send file to cloud then send back to user the URL
    console.log("file uploaded");
    try {
      uploadResult = await imageFileHandler.saveToCloudinary(
        pathToFile,
        "file"
      );
      res.status(statusCode.SUCCESS).send(uploadResult.url);
    } catch (err) {
      console.log("err uploading image to cloud");
      res.status(statusCode.SERVER_ERROR).send(err);
    } finally {
      fs.unlinkSync(pathToFile);
    }
  } else {
    res.status(statusCode.SUCCESS).send();
  }
});

module.exports = router;
