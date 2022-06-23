const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");

module.exports = (app) => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
      },
      async (username, password, done) => {
        console.log("Verifying account: ", username);

        const user = await userModel.get(username);
        if (!user) {
          return done(null, false, {
            message: "User not found",
          });
        }

        try {
          const pwdMatch = await bcrypt.compare(password, user.password);
          if (!pwdMatch) {
            return done(null, false, {
              message: "Incorrect password",
            });
          }
          return done(null, user);
        } catch (error) {
          console.log("Error passport:", error);
          return done(error);
        }
      }
    )
  );

  passport.serializeUser(function (user, done) {
    done(null, user.username);
  });
  passport.deserializeUser(async (username, done) => {
    try {
      let usertmp = await userModel.get(username);
      done(null, usertmp);
    } catch (error) {
      done(new Error("error"), null);
    }
  });

  app.use(passport.initialize());
};
