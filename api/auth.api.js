const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const accountModel = require("../models/user.model");
const { statusCode } = require("../constant");

const checkAuth = require("../middlewares/checkAuth");
const userModel = require("../models/user.model");

const imageFileHandler = require("../helper/imageFileHandler");

const saltRounds = 10,
  secretKey = "ThisIsASecretKey";

const setAuthToken = (res, user) => {
  const expirationSeconds = 1000; // one day
  const cookieExpiration = Date.now() + expirationSeconds * 1000;

  const payload = {
    exp: cookieExpiration,
    username: user.username,
  };

  const token = jwt.sign(JSON.stringify(payload), secretKey, {
    algorithm: "HS256",
  });

  const options = {
    magAge: expirationSeconds * 1000,
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  res.cookie("jwt", token, options);

  const returnUser = { ...user };
  returnUser.password = "";
  return res.status(statusCode.SUCCESS).json(returnUser);
};

router.post("/login", (req, res, next) => {
  console.log(req.body);
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      console.log("Error", err);
      res.status(statusCode.SERVER_ERROR).send(err.toString());
      return;
    }
    if (!user) {
      res.status(statusCode.BAD_REQUEST).send(info);
      return;
    }
    req.logIn(user, function (err) {
      if (err) {
        res.status(statusCode.BAD_REQUEST).send(err.toString());
        return;
      }
      return setAuthToken(res, user);
    });
  })(req, res, next);
});

router.get("/", checkAuth, async (req, res, next) => {
  const user = await userModel.get(res.locals.username);

  const returnUser = { ...user };
  returnUser.password = "";

  res.status(statusCode.SUCCESS).json(returnUser);
});

router.post("/logout", (req, res) => {
  res.cookie("jwt", "", {
    expires: new Date(0),
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.clearCookie("jwt");
  res.status(statusCode.SUCCESS).send("logout successfully");
});

const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const path = require("path");
const { unlink } = require("node:fs/promises");

router.post("/register", upload.single("avatar"), async (req, res) => {
  const { username, password, name, phone, gender } = req.body;
  const avatar = req.file;

  const hashedPassword = await bcrypt.hash(password, saltRounds);
  let account = await accountModel.get(username);
  if (account) {
    res.status(statusCode.BAD_REQUEST).send("Username already existed");
    return;
  }
  let phoneNumber = await accountModel.getByPhone(phone);
  if (phoneNumber) {
    res.status(statusCode.BAD_REQUEST).send("Phone already existed");
    return;
  }
  let uploadResult;
  try {
    const pathToAvatar = path.join(__dirname, "../uploads/", avatar.filename);
    uploadResult = avatar
      ? await imageFileHandler.saveToCloudinary(pathToAvatar, "avatar")
      : null;
    await unlink(pathToAvatar);
    console.log("image result", result);
  } catch (err) {
    console.log("err uploading image to cloudinary", err);
  }
  const rs = await accountModel.insert({
    username,
    password: hashedPassword,
    name,
    phone,
    gender,
    avatar: uploadResult.url,
  });
  if (rs) {
    res.status(statusCode.CREATED).send("Account created successfully");
  } else {
    res.status(statusCode.SERVER_ERROR).send("Something went wrong");
  }
});

module.exports = router;
