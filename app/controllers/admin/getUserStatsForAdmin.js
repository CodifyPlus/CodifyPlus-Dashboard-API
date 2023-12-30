const db = require("../../models");
const User = db.user;

exports.getUserStatsForAdmin = async (req, res) => {
    try {
        const userId = req.query.userId;

        // Fetch user by ID
        const user = await User.findById(userId).exec();

        // Send the response
        res.status(200).send(user);
    } catch (err) {
        // Handle errors
        console.error(err);
        res.status(500).send({ message: err.message });
    }
};
