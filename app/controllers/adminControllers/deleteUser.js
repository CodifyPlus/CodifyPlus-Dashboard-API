const db = require("../../models");
const User = db.user;
const Service = db.service;
const ChatBox = db.chatBox;

exports.deleteUser = async (req, res) => {
    try {
        // Find the user by ID
        const targetUser = await User.findByIdAndDelete(req.body.userId);

        // Delete chatboxes where user's ID is in the participants array
        if (targetUser.role === 'USER') {
            await ChatBox.deleteMany({ participants: targetUser._id });
        }

        await Service.deleteMany({ 'assignedFor.userId': targetUser._id });

        res.status(200).send({ message: "Deleted!" });
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
    }
};