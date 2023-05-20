const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    phone: String,
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
      }
    ],
    status: String,
    completedServices: [mongoose.Schema.Types.ObjectId],
    pendingServices: [mongoose.Schema.Types.ObjectId],
    processServices: [mongoose.Schema.Types.ObjectId],
    firstName: String,
    lastName: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    notifications: [{
      title: String,
      description: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  })
);

module.exports = User;
