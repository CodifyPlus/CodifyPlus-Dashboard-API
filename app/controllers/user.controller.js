const db = require("../models");
const User = db.user;
const Service = db.service;
const MessageBox = db.messageBox;
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const config = require("../config/auth.config");

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};

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
      console.log(service, db.mongoose.Types.ObjectId(req.query.serviceId))
      res.status(200).send(service);
      return;
    }
  });
};

exports.postServiceInfo = (req, res) => {

};

exports.getAllUsers = (req, res) => {
  User.find({}).exec((err, users) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    else {
      res.status(200).send(users);
      return;
    }
  });
};

exports.changeUserRole = (req, res) => {
  const { newRole, userId } = req.body;
  User.findByIdAndUpdate(userId, { role: newRole },
    function (err, docs) {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      else {
        res.status(204);
      }
    });
};

exports.addNewUser = (req, res) => {
  const { username, email, password, sendEmail } = req.body;

  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8)
  });

  user.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (req.body.role) {
      user.role = req.body.role;
      user.save(err => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        res.send({ message: "User was registered successfully!" });
      });
    } else {
      user.role = "USER";
      user.save(err => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        else {
          //Send Email Logic
          res.send({ message: "User was registered successfully!" });
        }
      });
    }
  });
};

exports.getAllServices = (req, res) => {
  Service.find({}).exec((err, services) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    else {
      res.status(200).send(services);
      return;
    }
  });
};

exports.getAllUsernames = (req, res) => {
  User.find({}, "username").exec((err, users) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    else {
      const usernames = users.map(user => {
        return {
          value: user.username,
          label: user.username
        }
      });
      console.log(usernames)
      res.status(200).send(usernames);
      return;
    }
  });
};

exports.getAllModerators = (req, res) => {
  User.find({ role: 'MODERATOR' }, "username").exec((err, moderators) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    else {
      const usernames = moderators.map(user => {
        return {
          value: user.username,
          label: user.username
        }
      });
      console.log(usernames)
      res.status(200).send(usernames);
      return;
    }
  });
};