const mongoose = require("mongoose");

const Service = mongoose.model(
  "Service",
  new mongoose.Schema({
    cost: String,
    timelineDatesIsVisible: {
      type: Boolean,
      default: true
    },
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
        default: undefined
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
