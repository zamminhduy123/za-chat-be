const express = require("express");
const router = express.Router();

const conversationModel = require("../models/conversation.model");
const userModel = require("../models/user.model");
const { statusCode } = require("../constant");
const keyModel = require("../models/key.model");

const { Buffer } = require("buffer");

router.get("/:username", async (req, res) => {
  const username = req.params.username;
  const deviceKey = decodeURIComponent(req.query.deviceKey);
  console.log("GET KEY", username, req.query.deviceKey);
  if (!username) {
    res.status(statusCode.BAD_REQUEST).send("Need username");
    return;
  }
  if (req.query.deviceKey) {
    try {
      const key = await keyModel.get(deviceKey);
      console.log("KEY", key);
      if (key) {
        res.status(statusCode.SUCCESS).json({ keys: [key] });
      } else {
        res.status(statusCode.BAD_REQUEST).send("Key not found");
      }
    } catch (err) {
      res.status(statusCode.SERVER_ERROR).send();
    }
  } else {
    try {
      const user = await userModel.get(username);
      if (user) {
        const keyOfUsername = await keyModel.getByUsername(username);
        console.log("KEY", keyOfUsername);
        if (keyOfUsername) {
          res.status(statusCode.SUCCESS).json({ keys: keyOfUsername });
        } else {
          res.status(statusCode.BAD_REQUEST).send("No key with given username");
        }
      } else {
        res.status(statusCode.BAD_REQUEST).send("Username not existed");
      }
    } catch (err) {
      res.status(statusCode.SERVER_ERROR).send();
    }
  }
});
module.exports = router;
