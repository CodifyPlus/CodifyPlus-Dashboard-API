const mongoose = require("mongoose");

const Service = mongoose.model(
  "Service",
  new mongoose.Schema({
    cost: String,
    name: String,
    status: String,
    assignedTo: {
      userId: mongoose.Schema.Types.ObjectId,
      username: String,
      email: String,
    },
    pathway: [{
      startedAt: {
        type: Date,
        default: Date.now
      },
      notification: Boolean,
      description: String,
      title: String,
      status: Boolean,
      index: Number,
    }],
    duration: String,
    assignedFor:
    {
      userId: mongoose.Schema.Types.ObjectId,
      username: String,
      email: String,
    },
  })
);

module.exports = Service;
