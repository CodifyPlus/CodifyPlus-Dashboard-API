const db = require("../../models");
const Service = db.service;

exports.approveNote = (req, res) => {
    try {
        Service.findById(db.mongoose.Types.ObjectId(req.body.serviceId)).exec((err, service) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
            else {
                const noteId = req.body.noteId;
                const note = service.notes.find((n) => n._id.toString() === noteId);
                note.approved = !note.approved;
                const indexOfNote = service.notes.findIndex((n) => n._id.toString() === noteId);
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