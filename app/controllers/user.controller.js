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
      res.status(200).send(usernames);
      return;
    }
  });
};

exports.getAllModerators = (req, res) => {
  User.find({ role: { $in: ['MODERATOR', 'ADMIN'] } }, "username").exec((err, moderators) => {
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
      res.status(200).send(usernames);
      return;
    }
  });
};

exports.addNewService = async (req, res) => {
  const { name, cost, duration, assignedTo, assignedFor } = req.body;
  const assignedForDoc = await User.findOne({ username: assignedFor });

  const assignedToDoc = await User.findOne({ username: assignedTo });

  const service = new Service({
    name: req.body.name,
    cost: req.body.cost,
    status: "Pending",
    pathway: [
      {
        description: "Service has been initiated!",
        title: "Service initiated!",
        status: true,
      }
    ],
    duration: req.body.duration,
    assignedFor: {
      username: assignedForDoc.username,
      userId: assignedForDoc._id,
      email: assignedForDoc.email,
    },
    assignedTo: {
      username: assignedToDoc.username,
      userId: assignedToDoc._id,
      email: assignedToDoc.email,
    },
    notes: [],
  });

  service.save(async (err, service) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    const user = await User.findOne({ username: assignedFor });
    user.processServices.push({
      serviceId: service._id,
      name: service.name,
    });
    user.save(err => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
    });;

    res.status(200).send(service._id);
  });
};

exports.addNote = (req, res) => {
  Service.findById(db.mongoose.Types.ObjectId(req.body.serviceId)).exec((err, service) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    else {
      const newNote = {
        information: req.body.information,
        private: req.body.private,
        createdAt: new Date()
      };

      service.notes.push(newNote);

      service.save((err, updatedService) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        } else {
          res.status(200).send(updatedService);
          return;
        }
      });
    }
  });
};

exports.addTrack = (req, res) => {
  Service.findById(db.mongoose.Types.ObjectId(req.body.serviceId)).exec((err, service) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    else {
      const newTrackPoint = {
        description: req.body.description,
        title: req.body.title,
        startedAt: req.body.startedAt,
        status: req.body.status,
      };

      service.pathway.push(newTrackPoint);

      service.save((err, updatedService) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        } else {
          res.status(200).send(updatedService);
          return;
        }
      });
    }
  });
};

exports.editTrackStatus = (req, res) => {
  Service.findById(db.mongoose.Types.ObjectId(req.body.serviceId)).exec((err, service) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    else {
      const pathwayId = req.body.pathwayId;
      const pathway = service.pathway.find((p) => p._id.toString() === pathwayId);
      pathway.status = true;

      service.save((err, updatedService) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        } else {
          res.status(200).send(updatedService);
          return;
        }
      });
    }
  });
};
