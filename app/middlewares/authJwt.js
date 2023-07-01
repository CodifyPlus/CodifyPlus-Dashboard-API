const jwt = require("jsonwebtoken");
const db = require("../models");
const Service = db.service;
const User = db.user;
require("dotenv").config();

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }
    req.userId = decoded.id;
    next();
  });
};

isAdmin = (req, res, next) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    if (user.role === "ADMIN") {
      next();
      return;
    }
    res.status(403).send({ message: "Require Admin Role!" });
    return;
  });
};

isModerator = (req, res, next) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    if (user.role === "MODERATOR" || user.role === "ADMIN") {
      next();
      return;
    }
    res.status(403).send({ message: "Require Moderator Role!" });
    return;
  });
};

isAssignedToUpstreamService = (req, res, next) => {
  Service.findById(req.body.serviceId).exec((err, service) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    if (db.mongoose.Types.ObjectId(req.userId).toString() === db.mongoose.Types.ObjectId(service.assignedTo.userId).toString()) {
      next();
      return;
    }
    res.status(403).send({ message: "This Moderator is not assigned to upstream service!" });
    return;
  });
}

const authJwt = {
  verifyToken,
  isAdmin,
  isModerator,
  isAssignedToUpstreamService
};
module.exports = authJwt;
