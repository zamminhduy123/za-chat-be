const express = require("express");
const router = express.Router();

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
const { unlink } = require("node:fs/promises");

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
    await unlink(pathToFile);
  }
});

router.post("/chunkUpload", async (req, res) => {
  const { name, currentChunkIndex, totalChunks } = req.body;
  const firstChunk = parseInt(currentChunkIndex) === 0;
  const lastChunk = parseInt(currentChunkIndex) === parseInt(totalChunks) - 1;
  const ext = name.split(".").pop();
  const data = req.body.toString().split(",")[1];
  const buffer = new Buffer(data, "base64");
  const tmpFilename = "tmp_" + md5(name + req.ip) + "." + ext;
  if (firstChunk && fs.existsSync("./uploads/" + tmpFilename)) {
    fs.unlinkSync("./uploads/" + tmpFilename);
  }
  fs.appendFileSync("./uploads/" + tmpFilename, buffer);
  if (lastChunk) {
    const finalFilename = md5(Date.now()).substr(0, 6) + "." + ext;
    fs.renameSync("./uploads/" + tmpFilename, "./uploads/" + finalFilename);
    res.status(statusCode.SUCCESS).send({ finalFilename });
  } else {
    res.status(statusCode.SUCCESS).send();
  }
});

module.exports = router;
