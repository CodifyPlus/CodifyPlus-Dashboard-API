const db = require("../../models");
const Service = db.service;

exports.toggleTimelineDatesVisibility = async (req, res) => {
    try {
        // Find the service by ID
        const targetService = await Service.findById(req.body.serviceId);

        // Toggle the visibility of timeline dates
        targetService.timelineDatesIsVisible = targetService.timelineDatesIsVisible !== undefined ? !targetService.timelineDatesIsVisible : false;

        const updatedService = await targetService.save();
        res.status(200).send(updatedService);
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
    }
};