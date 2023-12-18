const db = require("../../models");
const User = db.user;

exports.changeUserRole = (req, res) => {
    try {
        const { newRole, userId } = req.body;
        User.findByIdAndUpdate(userId, { role: newRole },
            function (err, docs) {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }
                else {
                    res.status(204);
                }
            });
    }
    catch (error) {
        res.status(500).send({ message: error.message });
    }
};