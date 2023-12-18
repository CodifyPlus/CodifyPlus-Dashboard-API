const db = require("../../models");
const Service = db.service;

exports.getAdminStats = (req, res) => {
    try {
        // Find all services
        Service.find({}).exec((err, services) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }

            // Extract relevant information from each service
            const completedServices = [];
            const pendingServices = [];
            const processServices = [];

            services.forEach(service => {
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
            const adminStats = {
                completedServices,
                pendingServices,
                processServices,
            };

            // Send the response
            res.status(200).send(adminStats);
        });
    }
    catch (err) {
        res.status(500).send({ message: err.message });
        return;
    }
};