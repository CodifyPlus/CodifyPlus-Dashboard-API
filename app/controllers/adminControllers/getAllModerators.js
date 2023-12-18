const db = require("../../models");
const User = db.user;

exports.getAllModerators = (req, res) => {
    try {
        User.find({ role: { $in: ['MODERATOR', 'ADMIN'] } }, "username").exec((err, moderators) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
            else {
                const usernames = moderators.map(user => {
                    return {
                        value: user.username,
                        label: user.username
                    }
                });
                res.status(200).send(usernames);
                return;
            }
        });
    }
    catch (err) {
        res.status(500).send({ message: err.message });
        return;
    }
};