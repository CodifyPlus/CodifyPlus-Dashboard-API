const db = require("../../models");
const Service = db.service;
const { sendTelegramMessage } = require("../../config/telegram");

exports.editTrackStatusMod = async (req, res) => {
    try {
        const serviceId = req.body.serviceId;
        const pathwayId = req.body.pathwayId;

        const service = await Service.findById(serviceId).exec();

        if (!service) {
            return res.status(404).send({ message: "Service not found" });
        }

        const pathway = service.pathway.find((p) => p._id.toString() === pathwayId);

        if (!pathway) {
            return res.status(404).send({ message: "Pathway not found" });
        }

        pathway.status = !pathway.status;
        const message = `Moderator ${service.assignedTo.username} changed the status of pathway item of ${service.name} assigned for ${service.assignedFor.username}.

Previous Status: ${pathway.status ? "Pending" : "Completed"}
New Status: ${pathway.status ? "Completed" : "Pending"}
Pathway Item Details: ${pathway.title}
`;
        sendTelegramMessage(message);

        const updatedService = await service.save();

        // Redacting fields
        const { cost, assignedFor, ...rest } = updatedService.toObject();
        const redactedService = {
            ...rest,
            assignedFor: assignedFor ? { ...assignedFor, email: undefined } : undefined,
        };

        res.status(200).send(redactedService);
    } catch (error) {
        console.error("Error in editTrackStatusMod:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};
