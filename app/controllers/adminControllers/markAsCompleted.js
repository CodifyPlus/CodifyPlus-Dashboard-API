const db = require("../../models");
const User = db.user;
const Service = db.service;

exports.markAsCompleted = (req, res) => {
    Service.findById(db.mongoose.Types.ObjectId(req.body.serviceId)).exec((err, service) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        else {
            service.status = service.status === "Pending" ? "Completed" : "Pending";
            service.save(async (err, updatedService) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                } else {
                    const user = await User.findOne({ username: updatedService.assignedFor.username });
                    const containsRequiredServiceId = user.completedServices.some(obj => obj.serviceId.toString() === updatedService._id.toString());
                    if (!containsRequiredServiceId) {
                        user.completedServices.push({
                            serviceId: updatedService._id,
                            name: updatedService.name,
                        });
                        const filteredArray = user.processServices.filter(obj => obj.serviceId.toString() !== updatedService._id.toString());
                        user.processServices = filteredArray;
                    }
                    if (containsRequiredServiceId) {
                        const filteredArray = user.completedServices.filter(obj => obj.serviceId.toString() !== updatedService._id.toString());
                        user.completedServices = filteredArray;
                        user.processServices.push({
                            serviceId: updatedService._id,
                            name: updatedService.name,
                        });
                    }
                    user.save(err => {
                        if (err) {
                            res.status(500).send({ message: err });
                            return;
                        }
                        else {
                            res.status(200).send(updatedService);
                            return;
                        }
                    });
                }
            });
        }
    });
};