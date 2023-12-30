const db = require("../../models");
const Service = db.service;
const { emailTemplate } = require("../../templates/emailTemplate");
const { sendEmail } = require("../../config/emailer");

exports.addTrack = async (req, res) => {
    try {
        const serviceId = db.mongoose.Types.ObjectId(req.body.serviceId);

        // Find the service by ID
        const service = await Service.findById(serviceId);

        if (!service) {
            res.status(404).send({ message: "Service not found" });
            return;
        }

        // Create a new track point
        const newTrackPoint = {
            description: req.body.description,
            title: req.body.title,
            startedAt: req.body.startedAt,
            approved: true,
            status: req.body.status,
        };

        // Add the new track point to the service
        service.pathway.push(newTrackPoint);

        // Save the updated service
        const updatedService = await service.save();

        // Send email if requested
        if (req.body.sendEmail) {
            const contentForEmail = `
                Check current status for your service <b>"${updatedService.name}"</b>
                <br>
                <br>
                Status: <b>${updatedService.pathway[updatedService.pathway.length - 1].title}</b>
                <br>
                Description: ${updatedService.pathway[updatedService.pathway.length - 1].description}
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
