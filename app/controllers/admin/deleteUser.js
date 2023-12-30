const db = require("../../models");
const User = db.user;
const Service = db.service;
const ChatBox = db.chatBox;

exports.deleteUser = async (req, res) => {
    try {
        // Find and delete the user by ID
        const targetUser = await User.findByIdAndDelete(req.body.userId);

        if (!targetUser) {
            res.status(404).send({ message: "User not found" });
            return;
        }

        // Delete chatboxes where user's ID is in the participants array
        if (targetUser.role === 'USER') {
            await ChatBox.deleteMany({ participants: targetUser._id });
        }

        // Delete services assigned to the user
        await Service.deleteMany({ 'assignedFor.userId': targetUser._id });

        res.status(200).send({ message: "Deleted!" });
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};
