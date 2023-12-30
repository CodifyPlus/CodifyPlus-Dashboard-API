const db = require("../../models");
const Service = db.service;
const { sendTelegramMessage } = require("../../config/telegram");

exports.addNoteMod = async (req, res) => {
    try {
        const serviceId = req.body.serviceId;
        const service = await Service.findById(serviceId).exec();

        if (!service) {
            return res.status(404).send({ message: "Service not found" });
        }

        const newNote = {
            information: req.body.information,
            private: false,
            approved: false,
            createdAt: new Date(),
        };

        service.notes.push(newNote);

        const updatedService = await service.save();

        const message = `Moderator ${service.assignedTo.username} added a note to ${service.name} assigned for ${service.assignedFor.username}.\n\nNote: ${newNote.information}`;
        sendTelegramMessage(message);

        res.status(200).send(updatedService);
    } catch (error) {
        console.error("Error in addNoteMod:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};
