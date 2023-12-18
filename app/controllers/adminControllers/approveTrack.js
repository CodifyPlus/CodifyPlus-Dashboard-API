const db = require("../../models");
const Service = db.service;
const { emailTemplate } = require("../../templates/emailTemplate");
const { sendEmail } = require("../../config/emailer");

exports.approveTrack = (req, res) => {
    try {
        Service.findById(db.mongoose.Types.ObjectId(req.body.serviceId)).exec((err, service) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
            else {
                const pathwayId = req.body.pathwayId;
                const pathway = service.pathway.find((p) => p._id.toString() === pathwayId);
                const toSendEmail = pathway.sendEmail;
                pathway.sendEmail = false;
                pathway.approved = !pathway.approved;
                const indexOfPoint = service.pathway.findIndex((p) => p._id.toString() === pathwayId);

                service.save(async (err, updatedService) => {
                    if (err) {
                        res.status(500).send({ message: err });
                        return;
                    } else {
                        if (toSendEmail) {
                            const contentForEmail = `
            Check current status for your service <b>"${updatedService.name}"</b>
            <br>
            <br>
            Status: <b>${updatedService.pathway[indexOfPoint].title}</b>
            <br>
            Description: ${updatedService.pathway[indexOfPoint].description}
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
    }
    catch (err) {
        res.status(500).send({ message: err.message });
        return;
    }
};