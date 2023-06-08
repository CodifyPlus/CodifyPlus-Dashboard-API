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
  NotificationBox.findOne({ belongsTo: req.query.username }).exec(async (err, notificationBox) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    else {
      if (!notificationBox) {
        const newNotificationBox = new NotificationBox({
          belongsTo: req.query.username,
          notifications: [],
        });
        await newNotificationBox.save();
      }
      res.status(200).send(notificationBox ? notificationBox.notifications : []);
      return;
    }
  });
};

exports.deleteNotification = async (req, res) => {

  NotificationBox.findOne({ belongsTo: req.body.username }).exec(async (err, notificationBox) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    else {
      const notificationIndex = notificationBox.notifications.findIndex(notification => notification._id.toString() === req.body.notificationId);

      notificationBox.notifications.splice(notificationIndex, 1);

      notificationBox.save((saveErr) => {
        if (saveErr) {
          res.status(500).send({ message: saveErr });
          return;
        }
        else {
          res.status(200).send(notificationBox ? notificationBox.notifications : []);
          return;
        }

      });
    }
  });
};

exports.updateProfile = async (req, res) => {
  User.findById(req.userId).exec(async (err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    else {
      if (req.body.fullname && req.body.email && req.body.phone) {
        user.fullname = req.body.fullname;
        user.email = req.body.email;
        user.phone = req.body.phone;
        user.save((saveErr) => {
          if (saveErr) {
            res.status(500).send({ message: saveErr });
            return;
          }
          else {
            res.status(200).send(user);
            return;
          }
        });
      }
    }
  });
};

exports.changePassword = async (req, res) => {
  User.findById(req.userId).exec(async (err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    else {
      var passwordIsValid = bcrypt.compareSync(
        req.body.oldPassword,
        user.password
      );
      if (passwordIsValid && (req.body.newPassword === req.body.confirmNewPassword)) {
        user.password = bcrypt.hashSync(req.body.newPassword, 8);
        user.save((saveErr) => {
          if (saveErr) {
            res.status(500).send({ message: saveErr });
            return;
          }
          else {
            res.status(200).send(user);
            return;
          }
        });
      }
      else {
        res.status(500).send({ error: "Old password is incorrect!" });
        return;
      }
    }
  });
};