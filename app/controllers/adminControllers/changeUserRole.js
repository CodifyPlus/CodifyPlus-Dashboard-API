const db = require("../../models");
const User = db.user;

exports.changeUserRole = async (req, res) => {
    try {
        const { newRole, userId } = req.body;

        // Find and update the user's role
        const updatedUser = await User.findByIdAndUpdate(userId, { role: newRole }, { new: true }).exec();

        if (!updatedUser) {
            res.status(404).send({ message: "User not found" });
            return;
        }

        res.status(204).send();
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).send({ message: error.message });
    }
};
