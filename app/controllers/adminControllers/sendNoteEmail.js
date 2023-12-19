const db = require("../../models");
const Service = db.service;
const { emailTemplate } = require("../../templates/emailTemplate");
const { sendEmail } = require("../../config/emailer");

exports.sendNoteEmail = async (req, res) => {
    try {
        const serviceId = req.body.serviceId;
        const noteId = req.body.noteId;

        // Fetch service by ID
        const service = await Service.findById(serviceId).exec();

        if (!service) {
            res.status(404).send({ message: "Service not found" });
            return;
        }

        // Find the index of the note in the service's notes array
        const indexOfNote = service.notes.findIndex((n) => n._id.toString() === noteId);

        if (indexOfNote === -1) {
            res.status(404).send({ message: "Note not found" });
            return;
        }

        // Compose email content
        const contentForEmail = `
            A new notification has been added to your service "${service.name}"
            <br>
            <br>
            Notification:
            <br>
            ${service.notes[indexOfNote].information}
        `;

        // Create email template
        const emailContent = emailTemplate(contentForEmail);

        // Compose email subject
        const emailSubject = `Start-Up Kro - ${service.name} - Notification!`;

        // Send the email
        await sendEmail(service.assignedFor.email, emailContent, emailSubject);

        // Send the response
        res.status(200).send("Note Sent!");
    } catch (err) {
        // Handle errors
        console.error(err);
        res.status(500).send({ message: err.message });
    }
};
