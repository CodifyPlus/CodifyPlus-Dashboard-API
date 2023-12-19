const db = require("../../models");
const Service = db.service;
const { emailTemplate } = require("../../templates/emailTemplate");
const { sendEmail } = require("../../config/emailer");

exports.approveTrack = async (req, res) => {
    try {
        const serviceId = db.mongoose.Types.ObjectId(req.body.serviceId);

        // Find the service by ID
        const service = await Service.findById(serviceId);

        if (!service) {
            res.status(404).send({ message: "Service not found" });
            return;
        }

        const pathwayId = req.body.pathwayId;
        const pathway = service.pathway.find((p) => p._id.toString() === pathwayId);

        if (!pathway) {
            res.status(404).send({ message: "Pathway not found" });
            return;
        }

        const toSendEmail = pathway.sendEmail;
        pathway.sendEmail = false;

        // Toggle the approval status of the track point
        pathway.approved = !pathway.approved;

        // Save the updated service
        const updatedService = await service.save();

        // Send email if requested
        //TODO: REMOVE EMAIL SEND LOGIC FROM MODERATOR FRONTEND ADD TRACK POINT FORM
        if (false || toSendEmail) {
            const indexOfPoint = updatedService.pathway.findIndex((p) => p._id.toString() === pathwayId);

            const contentForEmail = `
                Check current status for your service <b>"${updatedService.name}"</b>
                <br>
                <br>
                Status: <b>${updatedService.pathway[indexOfPoint].title}</b>
                <br>
                Description: ${updatedService.pathway[indexOfPoint].description}
            `;

            const emailContent = emailTemplate(contentForEmail);
            const emailSubject = `Start-Up Kro - ${updatedService.name} - Status Update!`;

            sendEmail(updatedService.assignedFor.email, emailContent, emailSubject);
        }

        res.status(200).send(updatedService);
    } catch (err) {
        // Handle errors
        console.error(err);
        res.status(500).send({ message: err.message });
    }
};
