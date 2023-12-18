const { novu } = require("../../../server");

exports.sendNotification = async (req, res) => {
    try {
        novu.trigger('codifyplus', {
            to: {
                subscriberId: req.body.username,
            },
            payload: {
                description: req.body.content,
            }
        });
        res.status(200).json("Notification sent!");
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};