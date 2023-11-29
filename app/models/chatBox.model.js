const mongoose = require("mongoose");

const ChatBoxSchema = new mongoose.Schema({
    serviceId: { type: mongoose.Schema.Types.ObjectId },
    serviceName: {
        type: String,
        required: true,
    },
    assignedFor: {
        type: String,
        required: true,
    },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    messages: [
        {
            sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            content: { type: String, required: true },
            timestamp: { type: Date, default: Date.now },
        },
    ],
});

const ChatBox = mongoose.model("ChatBox", ChatBoxSchema);

module.exports = ChatBox;
