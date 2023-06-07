const mongoose = require("mongoose");

const NotificationBoxSchema = new mongoose.Schema({
    belongsTo: mongoose.Schema.Types.ObjectId,
    notifications: [{
        sentAt: {
            type: Date,
            default: Date.now
        },
        message: String,
        title: String,
    }],
});

const NotificationBox = mongoose.model("NotificationBox", NotificationBoxSchema);

module.exports = NotificationBox;
