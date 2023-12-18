const db = require("../../models");
const Service = db.service;
const { emailTemplate } = require("../../templates/emailTemplate");
const { sendEmail } = require("../../config/emailer");

exports.sendNoteEmail = (req, res) => {
    try {
        Service.findById(db.mongoose.Types.ObjectId(req.body.serviceId)).exec((err, service) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
            else {
                const noteId = req.body.noteId;
                const indexOfNote = service.notes.findIndex((n) => n._id.toString() === noteId);
                const contentForEmail = `
                        A new notification has been added to your service "${service.name}"
                        <br>
                        <br>
                        Notification:
                        <br>
                        ${service.notes[indexOfNote].information}
            `;

                const emailC = emailTemplate(contentForEmail);

                const emailSubject = `Start-Up Kro - ${service.name} - Notification!`

                sendEmail(service.assignedFor.email, emailC, emailSubject);

                res.status(200).send("Note Sent!");
            }
        });
    }
    catch (err) {
        res.status(500).send({ message: err.message });
        return;
    }
};