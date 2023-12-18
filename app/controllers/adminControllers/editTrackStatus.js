const db = require("../../models");
const Service = db.service;

exports.editTrackStatus = (req, res) => {
    Service.findById(db.mongoose.Types.ObjectId(req.body.serviceId)).exec((err, service) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        else {
            const pathwayId = req.body.pathwayId;
            const pathway = service.pathway.find((p) => p._id.toString() === pathwayId);
            pathway.status = !pathway.status;

            service.save((err, updatedService) => {
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
};