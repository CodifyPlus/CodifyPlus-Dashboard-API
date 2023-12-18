const db = require("../../models");
const User = db.user;

exports.getAllUsernames = (req, res) => {
    try {
        User.find({}, "username").exec((err, users) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
            else {
                const usernames = users.map(user => {
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