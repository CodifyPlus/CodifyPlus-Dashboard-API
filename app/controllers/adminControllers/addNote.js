const db = require("../../models");
const Service = db.service;
const { emailTemplate } = require("../../templates/emailTemplate");
const { sendEmail } = require("../../config/emailer");

exports.addNote = (req, res) => {
    Service.findById(db.mongoose.Types.ObjectId(req.body.serviceId)).exec((err, service) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        else {
            const newNote = {
                information: req.body.information,
                private: req.body.private,
                approved: true,
                createdAt: new Date()
            };

            service.notes.push(newNote);

            service.save(async (err, updatedService) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                } else {

                    if (req.body.sendEmail) {
                        const contentForEmail = `
            A new notification has been added to your service "${updatedService.name}"
            <br>
            <br>
            Notification:
            <br>
            ${updatedService.notes[updatedService.notes.length - 1].information}
            `;

                        const emailC = emailTemplate(contentForEmail);

                        const emailSubject = `Start-Up Kro - ${updatedService.name} - Notification!`

                        sendEmail(updatedService.assignedFor.email, emailC, emailSubject);

                    }

                    res.status(200).send(updatedService);
                    return;
                }
            });
        }
    });
};