const db = require("../../models");
const User = db.user;

exports.getAllUsers = (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        // Fetch users
        User.find({})
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .exec((err, users) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }

                // Count total services
                User.countDocuments({}, (countErr, totalCount) => {
                    if (countErr) {
                        res.status(500).send({ message: countErr });
                        return;
                    }

                    // Send both services and total count in the response
                    res.status(200).send({
                        users,
                        total: totalCount,
                    });
                });
            });
    }
    catch (error) {
        res.status(500).send({ message: error.message });
    }
};