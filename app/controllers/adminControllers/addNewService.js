const db = require("../../models");
const User = db.user;
const Service = db.service;
const ChatBox = db.chatBox;
const { emailTemplate } = require("../../templates/emailTemplate");
const { sendEmail } = require("../../config/emailer");

exports.addNewService = async (req, res) => {
    const { name, cost, duration, assignedTo, assignedFor } = req.body;
    const assignedForDoc = await User.findOne({ username: assignedFor });

    const assignedToDoc = await User.findOne({ username: assignedTo });

    const service = new Service({
        name: req.body.name,
        cost: req.body.cost,
        status: "Pending",
        pathway: [
            {
                description: "Service has been initiated!",
                title: "Service initiated!",
                status: true,
            }
        ],
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

    service.save(async (err, service) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        const chatBox = new ChatBox({
            serviceName: name,
            assignedFor: assignedForDoc.username,
            participants: [assignedForDoc._id, assignedToDoc._id],
            serviceId: service._id,
            messages: [],
        });
        await chatBox.save();
        const user = await User.findOne({ username: assignedFor });
        user.processServices.push({
            serviceId: service._id,
            name: service.name,
        });
        user.save(err => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
        });

        if (req.body.sendEmailToUser) {
            const contentForEmail = `
        Thanks for choosing <b>"${service.name}"</b> service
        <br>
        <br>
        Your service details are as follows:
        <br>
        Name: ${service.name}
        <br>
        Cost: ${service.cost}
        <br>
        <br>
        <a href="dashboard.codifyplus.com"> Login Now!</a>
        `;

            const emailC = emailTemplate(contentForEmail);

            const emailSubject = `Start-Up Kro - Thanks for choosing Us!`

            sendEmail(service.assignedFor.email, emailC, emailSubject);

        }

        if (req.body.sendEmailToAssignee) {
            const contentForEmail = `
        You have been assigned a new service.
        <br>
        <br>
        Service details are as follows:
        <br>
        Service Name: ${service.name}
        <br>
        Service Duration: ${service.duration}
        <br>
        User's Name: ${service.assignedFor.username}
        <br>
        <a href="dashboard.codifyplus.com"> Login Now!</a>
        `;

            const emailC = emailTemplate(contentForEmail);

            const emailSubject = `Start-Up Kro - New Service Assigned!`

            await sendEmail(service.assignedTo.email, emailC, emailSubject);
        }
        res.status(200).send(service._id);
    });
};