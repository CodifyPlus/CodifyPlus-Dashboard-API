const db = require("../../models");
const Service = db.service;

exports.approveNote = async (req, res) => {
    try {
        const serviceId = db.mongoose.Types.ObjectId(req.body.serviceId);

        // Find the service by ID
        const service = await Service.findById(serviceId);

        if (!service) {
            res.status(404).send({ message: "Service not found" });
            return;
        }

        const noteId = req.body.noteId;
        const note = service.notes.find((n) => n._id.toString() === noteId);

        if (!note) {
            res.status(404).send({ message: "Note not found" });
            return;
        }

        // Toggle the approval status of the note
        note.approved = !note.approved;

        // Save the updated service
        const updatedService = await service.save();

        res.status(200).send(updatedService);
    } catch (err) {
        // Handle errors
        console.error(err);
        res.status(500).send({ message: err.message });
    }
};
