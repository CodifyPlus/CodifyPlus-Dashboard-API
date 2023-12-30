const db = require("../../models");
const Service = db.service;

exports.getModStats = async (req, res) => {
    try {
        // Find all services where the moderator is assigned to
        const services = await Service.find({ 'assignedTo.userId': req.userId }).exec();

        // Extract relevant information from each service
        const completedServices = [];
        const pendingServices = [];
        const processServices = [];

        services.forEach((service) => {
            const serviceInfo = {
                serviceId: service._id,
                name: service.name,
                username: service.assignedFor.username,
                // Add other relevant fields as needed
            };

            // Categorize services based on their status
            if (service.status === 'Completed') {
                completedServices.push(serviceInfo);
            } else if (service.status === 'Process') {
                pendingServices.push(serviceInfo);
            } else {
                processServices.push(serviceInfo);
            }
        });

        // Create the response object
        const moderatorStats = {
            completedServices,
            pendingServices,
            processServices,
        };

        // Send the response
        res.status(200).send(moderatorStats);
    } catch (error) {
        console.error("Error in getModStats:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};
