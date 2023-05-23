const mongoose = require("mongoose");

const MessageBoxSchema = new mongoose.Schema({
    belongsTo: mongoose.Schema.Types.ObjectId,
    subscriber: mongoose.Schema.Types.ObjectId,
    messages: [{
        sender: String,
        receiver: String,
        sentAt: {
            type: Date,
            default: Date.now
        },
        message: String,
    }],
});

const MessageBox = mongoose.model("MessageBox", MessageBoxSchema);

module.exports = MessageBox;
