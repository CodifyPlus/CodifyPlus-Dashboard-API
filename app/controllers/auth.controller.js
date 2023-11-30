const db = require("../models");
const User = db.user;
require("dotenv").config();
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { novu } = require("../../server");
const NotificationBox = db.notificationBox;

exports.signup = (req, res) => {
  const user = new User({
    username: req.body.username.toLowerCase(),
    email: req.body.email.toLowerCase(),
    password: bcrypt.hashSync(req.body.password, 8)
  });

  user.save(async (err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    const notificationBox = new NotificationBox({
      belongsTo: user.username,
      notifications: [],
    });
    user.role = "USER";
    await notificationBox.save();
    user.save(async err => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      await novu.subscribers.identify(req.body.username.toLowerCase(), {
        username: req.body.username.toLowerCase(),
      });
      res.send({ message: "User was registered successfully!" });
    });
  });
};

exports.signin = async (req, res) => {
  User.findOne({
    username: req.body.username.toLowerCase()
  })
    .exec(async (err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      var token = jwt.sign({ id: user.id }, process.env.SECRET, {
        expiresIn: 2678400 // 24 hours
      });
      await novu.subscribers.identify(req.body.username.toLowerCase(), {
        username: req.body.username.toLowerCase()
      });
      res.status(200).send({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        accessToken: token
      });
    });
};
