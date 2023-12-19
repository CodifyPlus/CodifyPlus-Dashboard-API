const db = require("../../models");
const Service = db.service;

exports.editTrackStatus = async (req, res) => {
    try {
        const serviceId = db.mongoose.Types.ObjectId(req.body.serviceId);

        // Find the service by ID
        const service = await Service.findById(serviceId).exec();

        if (!service) {
            res.status(404).send({ message: "Service not found" });
            return;
        }

        const pathwayId = req.body.pathwayId;
        const pathway = service.pathway.find((p) => p._id.toString() === pathwayId);

        if (!pathway) {
            res.status(404).send({ message: "Pathway not found" });
            return;
        }

        // Toggle the status of the track point
        pathway.status = !pathway.status;

        // Save the updated service
        const updatedService = await service.save();

        res.status(200).send(updatedService);
    } catch (err) {
        // Handle errors
        console.error(err);
        res.status(500).send({ message: err.message });
    }
};
