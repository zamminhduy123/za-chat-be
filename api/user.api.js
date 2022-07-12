const express = require("express");
const router = express.Router();

const userModel = require("../models/user.model");
const { statusCode } = require("../constant");

router.get("/", async (req, res) => {
  const content = req.query.content;
  console.log(content);
  if (content) {
    let result = [];
    const userByPhone = await userModel.getByPhone(content);
    if (userByPhone) {
      [...userByPhone];
    }
    const userByUsername = await userModel.get(content);
    if (userByUsername) {
      [...result, ...userByPhone];
    }
    result = result.map((el) => ({ ...el, password: "" }));
    res.status(statusCode.SUCCESS).json(result);
  } else {
    res.status(statusCode.BAD_REQUEST).send("Need content");
  }
});

module.exports = router;
