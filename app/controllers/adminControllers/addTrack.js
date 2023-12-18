const db = require("../../models");
const Service = db.service;
const { emailTemplate } = require("../../templates/emailTemplate");
const { sendEmail } = require("../../config/emailer");

exports.addTrack = (req, res) => {
    Service.findById(db.mongoose.Types.ObjectId(req.body.serviceId)).exec((err, service) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        else {
            const newTrackPoint = {
                description: req.body.description,
                title: req.body.title,
                startedAt: req.body.startedAt,
                approved: true,
                status: req.body.status,
            };

            service.pathway.push(newTrackPoint);

            service.save(async (err, updatedService) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                } else {

                    if (req.body.sendEmail) {
                        const contentForEmail = `
            Check current status for your service <b>"${updatedService.name}"</b>
            <br>
            <br>
            Status: <b>${updatedService.pathway[updatedService.pathway.length - 1].title}</b>
            <br>
            Description: ${updatedService.pathway[updatedService.pathway.length - 1].description}
            `;

                        const emailC = emailTemplate(contentForEmail);

                        const emailSubject = `Start-Up Kro - ${updatedService.name} - Status Update!`

                        sendEmail(updatedService.assignedFor.email, emailC, emailSubject);

                    }

                    res.status(200).send(updatedService);
                    return;
                }
            });
        }
    });
};