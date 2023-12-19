const { novu } = require("../../../server");

exports.sendNotification = async (req, res) => {
    try {
        const { username, content } = req.body;

        // Trigger the notification
        await novu.trigger('codifyplus', {
            to: {
                subscriberId: username,
            },
            payload: {
                description: content,
            }
        });

        // Send success response
        res.status(200).json("Notification sent!");
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).send({ message: error.message });
    }
};
