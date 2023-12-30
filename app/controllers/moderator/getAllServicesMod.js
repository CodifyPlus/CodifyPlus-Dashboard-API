const db = require("../../models");
const Service = db.service;

exports.getAllServicesMod = async (req, res) => {
    try {
        const { username } = req.query;

        // Use async/await for better readability
        const services = await Service.find({ 'assignedTo.username': username });

        // Redacting fields
        const redactedServices = services.map(service => {
            const { assignedFor, cost, assignedTo, ...rest } = service.toObject();
            const redactedAssignedFor = assignedFor ? { ...assignedFor, email: undefined } : undefined;
            return { assignedFor: redactedAssignedFor, ...rest };
        });

        res.status(200).send(redactedServices);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};