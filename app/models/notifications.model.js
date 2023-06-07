const mongoose = require("mongoose");

const NotificationBoxSchema = new mongoose.Schema({
    belongsTo: String,
    notifications: [{
        createdAt: {
            type: Date,
            default: Date.now
        },
        content: String,
        title: String,
    }],
});

const NotificationBox = mongoose.model("NotificationBox", NotificationBoxSchema);

module.exports = NotificationBox;
