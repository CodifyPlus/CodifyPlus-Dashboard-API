const db = require("../../models");
const User = db.user;

exports.getUserStatsForAdmin = (req, res) => {
    User.findById(req.query.userId).exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        else {
            res.status(200).send(user);
            return;
        }
    });
};