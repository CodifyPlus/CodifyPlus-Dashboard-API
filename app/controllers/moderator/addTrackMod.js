const db = require("../../models");
const Service = db.service;
const { sendTelegramMessage } = require("../../config/telegram");

exports.addTrackMod = async (req, res) => {
    try {
        const serviceId = req.body.serviceId;
        const service = await Service.findById(serviceId).exec();

        if (!service) {
            return res.status(404).send({ message: "Service not found" });
        }

        const newTrackPoint = {
            description: req.body.description,
            title: req.body.title,
            startedAt: req.body.startedAt,
            approved: false,
            status: req.body.status,
            sendEmail: req.body.sendEmail,
        };

        service.pathway.push(newTrackPoint);

        const updatedService = await service.save();

        const message = `Moderator ${service.assignedTo.username} added a track point to ${service.name} assigned for ${service.assignedFor.username}.

Track Point Details:
Title: ${newTrackPoint.title}
Description: ${newTrackPoint.description}
Started At: ${newTrackPoint.startedAt}
Status: ${newTrackPoint.status ? "Completed" : "Pending"}
Send Email: ${newTrackPoint.sendEmail ? "Yes" : "No"}
`;
        sendTelegramMessage(message);

        res.status(200).send(updatedService);
    } catch (error) {
        console.error("Error in addTrackMod:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};
