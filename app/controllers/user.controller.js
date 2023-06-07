const db = require("../models");
const User = db.user;
const Service = db.service;
const MessageBox = db.messageBox;
const NotificationBox = db.notificationBox;
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { emailTemplate } = require("../templates/emailTemplate");
const { sendEmail } = require("../config/emailer");

exports.getUserStats = (req, res) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    else {
      res.status(200).send(user);
      return;
    }
  });
};

exports.getServiceInfo = (req, res) => {
  Service.findById(db.mongoose.Types.ObjectId(req.query.serviceId)).exec((err, service) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    else {
      res.status(200).send(service);
      return;
    }
  });
};

exports.getAllNotifications = (req, res) => {
  NotificationBox.findOne({ belongsTo: req.query.username }).exec((err, notificationBox) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    else {
      res.status(200).send(notificationBox ? notificationBox.notifications : []);
      return;
    }
  });
};

