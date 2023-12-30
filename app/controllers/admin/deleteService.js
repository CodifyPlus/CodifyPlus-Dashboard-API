const db = require("../../models");
const User = db.user;
const Service = db.service;

exports.deleteService = async (req, res) => {
    try {
        const targetService = await Service.findById(req.body.serviceId);

        if (!targetService) {
            res.status(404).send({ message: "Service not found" });
            return;
        }

        const targetUser = await User.findOne({ username: targetService.assignedFor.username });

        const processIndex = targetUser.processServices.findIndex(service => service.serviceId.toString() === req.body.serviceId);
        const completeIndex = targetUser.completedServices.findIndex(service => service.serviceId.toString() === req.body.serviceId);

        if (processIndex !== -1) {
            targetUser.processServices.splice(processIndex, 1);
        }

        if (completeIndex !== -1) {
            targetUser.completedServices.splice(completeIndex, 1);
        }

        await Service.findByIdAndDelete(req.body.serviceId);
        await targetUser.save();

        res.status(200).send({ message: "Deleted!" });
    } catch (err) {
        // Handle errors
        console.error(err);
        res.status(500).send({ message: err.message });
    }
};
