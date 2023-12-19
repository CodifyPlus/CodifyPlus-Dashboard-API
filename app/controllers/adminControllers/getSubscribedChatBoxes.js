const db = require("../../models");
const ChatBox = db.chatBox;

exports.getSubscribedChatBoxes = async (req, res) => {
    try {
        // Fetch all chat boxes
        const chatBoxes = await ChatBox.find({});

        // Map chat boxes with the count of messages
        const chatBoxesWithMessageSize = chatBoxes.map((chatBox) => {
            const { serviceName, assignedFor, serviceId, _id, messages } = chatBox;
            const noOfMessages = messages ? messages.length : 0;
            return { serviceName, assignedFor, serviceId, _id, noOfMessages };
        });

        // Send the response
        res.status(200).json({ chatBoxes: chatBoxesWithMessageSize });
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).send({ message: error.message });
    }
};
