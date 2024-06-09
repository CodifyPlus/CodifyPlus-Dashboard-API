const db = require("../../models");
const User = db.user;
const Service = db.service;
const ChatBox = db.chatBox;
const Template = db.template;
const { emailTemplate } = require("../../templates/emailTemplate");
const { sendEmail } = require("../../config/emailer");

exports.addNewService = async (req, res) => {
    try {
        const { name, assignedTo, assignedFor, sendEmailToUser, sendEmailToAssignee } = req.body;

        // Find assignedFor and assignedTo users
        const assignedForDoc = await User.findOne({ username: assignedFor });
        const assignedToDoc = await User.findOne({ username: assignedTo });

        let pathway = [{ description: "Service has been initiated!", title: "Service initiated!", status: true }];

        // Check if template is required
        if (req.body.templateName) {
            const template = await Template.findOne({ templateName: req.body.templateName });
            pathway = template.pathway;
        }

        // Create a new Service instance
        const service = new Service({
            name,
            cost: req.body.cost,
            status: "Pending",
            pathway: pathway,
            duration: req.body.duration,
            assignedFor: {
                username: assignedForDoc.username,
                userId: assignedForDoc._id,
                email: assignedForDoc.email,
            },
            assignedTo: {
                username: assignedToDoc.username,
                userId: assignedToDoc._id,
                email: assignedToDoc.email,
            },
            notes: [],
        });

        // Save the service
        const savedService = await service.save();

        // Create and save a new ChatBox
        const chatBox = new ChatBox({
            serviceName: name,
            assignedFor: assignedForDoc.username,
            participants: [assignedForDoc._id, assignedToDoc._id],
            serviceId: savedService._id,
            messages: [],
        });
        await chatBox.save();

        // Update assignedFor user's processServices
        const user = await User.findOne({ username: assignedFor });
        user.processServices.push({
            serviceId: savedService._id,
            name: savedService.name,
        });
        await user.save();

        // Send email to assignedFor user if requested
        if (sendEmailToUser) {
            const contentForUserEmail = `
                Thanks for choosing <b>"${savedService.name}"</b> service
                <br>
                <br>
                Your service details are as follows:
                <br>
                Name: ${savedService.name}
                <br>
                Cost: ${savedService.cost}
                <br>
                <br>
                <a href="dashboard.StartupKro.com"> Login Now!</a>
            `;

            const userEmailContent = emailTemplate(contentForUserEmail);
            const userEmailSubject = `Start-Up Kro - Thanks for choosing Us!`;

            sendEmail(savedService.assignedFor.email, userEmailContent, userEmailSubject);
        }

        // Send email to assignedTo user if requested
        if (sendEmailToAssignee) {
            const contentForAssigneeEmail = `
                You have been assigned a new service.
                <br>
                <br>
                Service details are as follows:
                <br>
                Service Name: ${savedService.name}
                <br>
                Service Duration: ${savedService.duration}
                <br>
                User's Name: ${savedService.assignedFor.username}
                <br>
                <a href="dashboard.StartupKro.com"> Login Now!</a>
            `;

            const assigneeEmailContent = emailTemplate(contentForAssigneeEmail);
            const assigneeEmailSubject = `Start-Up Kro - New Service Assigned!`;

            await sendEmail(savedService.assignedTo.email, assigneeEmailContent, assigneeEmailSubject);
        }

        // Send the service ID in the response
        res.status(200).send(savedService._id);
    } catch (err) {
        // Handle errors
        console.error(err);
        res.status(500).send({ message: err.message });
    }
};
