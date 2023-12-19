const db = require("../../models");
const User = db.user;

exports.getAllModerators = async (req, res) => {
    try {
        // Find all moderators and admins
        const moderators = await User.find({ role: { $in: ['MODERATOR', 'ADMIN'] } }, "username").exec();

        // Map the usernames for response
        const usernames = moderators.map(user => ({
            value: user.username,
            label: user.username
        }));

        // Send the response
        res.status(200).send(usernames);
    } catch (err) {
        // Handle errors
        console.error(err);
        res.status(500).send({ message: err.message });
    }
};
