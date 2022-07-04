const express = require("express");
const router = express.Router();

const friendModel = require("../models/friend.model");
const { statusCode } = require("../constant");

router.get("/", async (req, res) => {
  if (!req.username) res.status(statusCode.BAD_REQUEST).send("Need username");
  try {
    const friend = await friendModel.get(req.query.username);
    res.status(statusCode.SUCCESS).send(friend);
  } catch (err) {
    res.status(statusCode.SERVER_ERROR).send(err);
  }
});

router.post("/add", async (req, res) => {
  const { username_1, username_2 } = req.body;
  if (username_1 && username_2) {
    try {
      const request = await friendModel.request(username_1, username_2);
      res.status(statusCode.SUCCESS).send(request);
    } catch (err) {
      res.status(statusCode.SERVER_ERROR).send(err);
    }
  } else {
    res.status(statusCode.BAD_REQUEST).send();
  }
});

router.post("/accept", async (req, res) => {
  const { id } = req.body;
  if (id) {
    try {
      const accept = await friendModel.accept(id);
      res.status(statusCode.SUCCESS).send(accept);
    } catch (err) {
      res.status(statusCode.SERVER_ERROR).send(err);
    }
  } else {
    res.status(statusCode.BAD_REQUEST).send();
  }
});

module.exports = router;
