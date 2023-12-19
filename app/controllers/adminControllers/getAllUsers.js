const db = require("../../models");
const User = db.user;

exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        // Fetch users with pagination
        const users = await User.find({})
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .exec();

        // Count total users
        const totalCount = await User.countDocuments({}).exec();

        // Send both users and total count in the response
        res.status(200).send({
            users,
            total: totalCount,
        });
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).send({ message: error.message });
    }
};
