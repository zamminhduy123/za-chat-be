const fs = require("fs");
const path = require("path");
//cloudinary
const cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: "dlyewzdxj",
  api_key: "799441184995468",
  api_secret: "8jEmZ_fYy5FjQIXakLnMzjJl3XM",
});

function getBase64Image(imgData) {
  return imgData.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
}

function randomString(length) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

const imageProcess = (base64) => {
  let guess = base64.match(/^data:image\/(png|jpeg);base64,/)[1];
  let ext = "";
  switch (guess) {
    case "png":
      ext = ".png";
      break;
    case "jpeg":
      ext = ".jpg";
      break;
    default:
      ext = ".bin";
      break;
  }
  let savedFilename = randomString(10) + "-" + new Date().getTime() + ext;
  const filePath = fs.writeFile(
    getBase64Image(base64),
    "base64",
    function (err) {
      if (err !== null) console.log(err);
      else console.log("Send photo success!");
    }
  );
  return __dirname + "/upload/" + savedFilename;
};

const saveToCloudinary = async (data, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload(
      data,
      { folder: folder, resource_type: "auto" },
      function (error, result) {
        console.log(error);
        if (error) {
          return reject(new Error(error));
        } else {
          return resolve(result);
        }
      }
    );
  });
};
const saveToCloudinaryFile = async (file) => {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload(file, function (error, result) {
      if (error) {
        return reject(new Error(error));
      } else {
        return resolve(result);
      }
    });
  });
};
module.exports = { imageProcess, saveToCloudinary };
