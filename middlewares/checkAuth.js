const { statusCode } = require("../constant");

function checkAuth(req, res, next) {
  if (!req.cookies.jwt) {
    res.sendStatus(statusCode.AUTH_FAIL);
  } else {
    const tokenData = require("jsonwebtoken").decode(req.cookies.jwt, true);
    res.locals.username = tokenData.username;
    next();
  }
}

module.exports = checkAuth;
