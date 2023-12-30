const db = require("../../models");
const Service = db.service;

exports.toggleTimelineDatesVisibility = async (req, res) => {
    try {
        const { serviceId } = req.body;

        // Find the service by ID
        const targetService = await Service.findById(serviceId);

        if (!targetService) {
            res.status(404).send({ message: "Service not found" });
            return;
        }

        // Toggle the visibility of timeline dates
        targetService.timelineDatesIsVisible = targetService.timelineDatesIsVisible !== undefined ? !targetService.timelineDatesIsVisible : false;

        // Save the updated service
        const updatedService = await targetService.save();

        // Send the updated service as a response
        res.status(200).send(updatedService);
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};
