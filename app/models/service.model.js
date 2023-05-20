const mongoose = require("mongoose");

const Service = mongoose.model(
  "Service",
  new mongoose.Schema({
    cost: String,
    name: String,
    status: String,
    assignedTo: [mongoose.Schema.Types.ObjectId],
    pathway: {
        startedAt: {
            type: Date,
            default: Date.now
        },
        completedAt: {
            type: Date,
            default: Date.now
        },
        notification: Boolean,
        description: String,
        title: String,
    },
    duration: String,
  })
);

module.exports = Service;
