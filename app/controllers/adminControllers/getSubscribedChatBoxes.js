const db = require("../../models");
const ChatBox = db.chatBox;

exports.getSubscribedChatBoxes = async (req, res) => {
    try {
        const userId = req.userId;

        const chatBoxes = await ChatBox.find({});

        const chatBoxesWithMessageSize = chatBoxes.map((chatBox) => {
            const { serviceName, assignedFor, serviceId, _id, messages } = chatBox;
            const noOfMessages = messages ? messages.length : 0;
            return { serviceName, assignedFor, serviceId, _id, noOfMessages };
        });

        res.status(200).json({ chatBoxes: chatBoxesWithMessageSize });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};