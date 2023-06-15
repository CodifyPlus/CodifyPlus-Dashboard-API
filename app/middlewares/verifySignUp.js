const db = require("../models");
const User = db.user;

checkDuplicateUsernameOrEmail = (req, res, next) => {
  // Check email
  if (!/^\S+@\S+$/.test(req.body.email)) {
    return res.status(400).send({ message: "Invalid email" });
  }

  // Check username
  if (!/^[a-zA-Z0-9]+$/.test(req.body.username)) {
    return res.status(400).send({ message: "The username must be unique and should not contain spaces or symbols!" });
  }

  // Check password
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/.test(req.body.password)) {
    return res.status(400).send({ message: "The password must contain at least one uppercase, lowercase, symbol, and a number, and length must be more than 8 characters" });
  }

  // Username
  User.findOne({
    username: req.body.username.toLowerCase()
  }).exec((err, user) => {
    if (err) {
      return res.status(500).send({ message: err });
    }

    if (user) {
      return res.status(400).send({ message: "Failed! Username is already in use!" });
    }

    // Email
    User.findOne({
      email: req.body.email.toLowerCase()
    }).exec((err, user) => {
      if (err) {
        return res.status(500).send({ message: err });
      }

      if (user) {
        return res.status(400).send({ message: "Failed! Email is already in use!" });
      }

      next();
    });
  });
};

checkRoleExisted = (req, res, next) => {
  if (req.body.role) {
    if (!ROLES.includes(req.body.role)) {
      res.status(400).send({
        message: `Failed! Role ${req.body.roles[i]} does not exist!`
      });
      return;
    }
  }

  next();
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail,
  checkRoleExisted
};

module.exports = verifySignUp;
