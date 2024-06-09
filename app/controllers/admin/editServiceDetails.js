const db = require("../../models");
const User = db.user;
const Service = db.service;
const ChatBox = db.chatBox;
const { emailTemplate } = require("../../templates/emailTemplate");
const { sendEmail } = require("../../config/emailer");

exports.editServiceDetails = async (req, res) => {
    try {
        const serviceId = db.mongoose.Types.ObjectId(req.body.serviceId);

        // Find the service by ID
        const service = await Service.findById(serviceId).exec();

        if (!service) {
            res.status(404).send({ message: "Service not found" });
            return;
        }

        // Update service details
        service.name = req.body.name;
        service.cost = req.body.cost;
        service.duration = req.body.duration;

        try {
            if (req.body.assignedTo.toLowerCase() !== service.assignedTo.username) {
                const newModerator = await User.findOne({ username: req.body.assignedTo });

                if (!newModerator) {
                    res.status(404).send({ message: "Assigned user not found" });
                    return;
                }

                // Update assignedTo details
                service.assignedTo = {
                    username: newModerator.username,
                    userId: newModerator._id,
                    email: newModerator.email,
                };

                // Update associated chatbox participants
                const associatedChatBox = await ChatBox.findOne({ serviceId: service._id });
                if (associatedChatBox) {
                    associatedChatBox.participants = [newModerator._id, service.assignedFor.userId];
                    await associatedChatBox.save();
                }
            }
        } catch (err) {
            res.status(500).send({ message: err.message });
            return;
        }

        // Save the updated service
        const updatedService = await service.save();

        // Send email if requested
        if (req.body.sendEmailToAssignee) {
            const contentForEmail = `
                You have been assigned a new service.
                <br>
                <br>
                Service details are as follows:
                <br>
                Service Name: ${updatedService.name}
                <br>
                Service Duration: ${updatedService.duration}
                <br>
                User's Name: ${updatedService.assignedFor.username}
                <br>
                <a href="dashboard.StartupKro.com"> Login Now!</a>
            `;

            const emailContent = emailTemplate(contentForEmail);
            const emailSubject = `Start-Up Kro - New Service Assigned!`;

            await sendEmail(updatedService.assignedTo.email, emailContent, emailSubject);
        }

        res.status(200).send(updatedService);
    } catch (err) {
        // Handle errors
        console.error(err);
        res.status(500).send({ message: err.message });
    }
};
