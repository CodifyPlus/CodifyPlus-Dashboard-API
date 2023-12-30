const db = require("../../models");
const User = db.user;
const Service = db.service;

exports.markAsCompleted = async (req, res) => {
    try {
        const serviceId = req.body.serviceId;

        // Fetch service by ID
        const service = await Service.findById(serviceId).exec();

        if (!service) {
            res.status(404).send({ message: "Service not found" });
            return;
        }

        // Toggle service status between "Pending" and "Completed"
        service.status = service.status === "Pending" ? "Completed" : "Pending";

        // Save the updated service
        const updatedService = await service.save();

        // Find the user associated with the service
        const user = await User.findOne({ username: updatedService.assignedFor.username });

        // Check if the user's completedServices array already contains the serviceId
        const containsRequiredServiceId = user.completedServices.some(obj => obj.serviceId.toString() === updatedService._id.toString());

        if (!containsRequiredServiceId) {
            // If not, add the service to completedServices and remove from processServices
            user.completedServices.push({
                serviceId: updatedService._id,
                name: updatedService.name,
            });
            user.processServices = user.processServices.filter(obj => obj.serviceId.toString() !== updatedService._id.toString());
        } else {
            // If yes, remove the service from completedServices and add to processServices
            user.completedServices = user.completedServices.filter(obj => obj.serviceId.toString() !== updatedService._id.toString());
            user.processServices.push({
                serviceId: updatedService._id,
                name: updatedService.name,
            });
        }

        // Save the updated user
        await user.save();

        // Send the response
        res.status(200).send(updatedService);
    } catch (err) {
        // Handle errors
        console.error(err);
        res.status(500).send({ message: err.message });
    }
};
