const db = require("../../models");
const User = db.user;

exports.getAllUsernames = async (req, res) => {
    try {
        // Find all usernames
        const users = await User.find({}, "username").exec();

        // Map the usernames for response
        const usernames = users.map(user => ({
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
