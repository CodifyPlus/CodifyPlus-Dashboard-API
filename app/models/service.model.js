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
      description: String,
      title: String,
      status: Boolean,
      approved: Boolean,
      sendEmail: Boolean,
    }],
    duration: String,
    assignedFor:
    {
      userId: mongoose.Schema.Types.ObjectId,
      username: String,
      email: String,
    },
    notes: [{
      information: String,
      private: Boolean,
      approved: Boolean,
      sendEmail: Boolean,
      createdAt: {
        type: Date,
        default: Date.now
      },
    }]
  })
);

module.exports = Service;
