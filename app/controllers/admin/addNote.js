const db = require("../../models");
const Service = db.service;
const { emailTemplate } = require("../../templates/emailTemplate");
const { sendEmail } = require("../../config/emailer");

exports.addNote = async (req, res) => {
    try {
        const serviceId = db.mongoose.Types.ObjectId(req.body.serviceId);

        // Find the service by ID
        const service = await Service.findById(serviceId);

        if (!service) {
            res.status(404).send({ message: "Service not found" });
            return;
        }

        // Create a new note
        const newNote = {
            information: req.body.information,
            private: req.body.private,
            approved: true,
            createdAt: new Date(),
        };

        // Add the new note to the service
        service.notes.push(newNote);

        // Save the updated service
        const updatedService = await service.save();

        // Send email if requested
        if (req.body.sendEmail) {
            const contentForEmail = `
                A new notification has been added to your service "${updatedService.name}"
                <br>
                <br>
                Notification:
                <br>
                ${updatedService.notes[updatedService.notes.length - 1].information}
            `;

            const emailContent = emailTemplate(contentForEmail);
            const emailSubject = `Start-Up Kro - ${updatedService.name} - Notification!`;

            sendEmail(updatedService.assignedFor.email, emailContent, emailSubject);
        }

        res.status(200).send(updatedService);
    } catch (err) {
        // Handle errors
        console.error(err);
        res.status(500).send({ message: err.message });
    }
};
