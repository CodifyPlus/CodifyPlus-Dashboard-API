const db = require("../../models");
const Service = db.service;

exports.editTrack = (req, res) => {
    try {
        Service.findById(db.mongoose.Types.ObjectId(req.body.serviceId)).exec((err, service) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
            else {
                const pathwayId = req.body.pathwayId;
                const pathway = service.pathway.find((p) => p._id.toString() === pathwayId);
                pathway.title = req.body.title;
                pathway.description = req.body.description;
                pathway.startedAt = req.body.startedAt;
                service.save(async (err, updatedService) => {
                    if (err) {
                        res.status(500).send({ message: err });
                        return;
                    } else {
                        res.status(200).send(updatedService);
                        return;
                    }
                });
            }
        });
    }
    catch (err) {
        res.status(500).send({ message: err.message });
        return;
    }
};