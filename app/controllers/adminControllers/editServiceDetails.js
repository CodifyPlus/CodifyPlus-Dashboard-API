const db = require("../../models");
const User = db.user;
const Service = db.service;
const ChatBox = db.chatBox;
const { emailTemplate } = require("../../templates/emailTemplate");
const { sendEmail } = require("../../config/emailer");

exports.editServiceDetails = async (req, res) => {
    try {
        Service.findById(db.mongoose.Types.ObjectId(req.body.serviceId)).exec(async (err, service) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
            else {
                service.name = req.body.name;
                service.cost = req.body.cost;
                service.duration = req.body.duration;
                if (req.body.assignedTo.toLowerCase() !== service.assignedTo.username) {
                    const newModerator = await User.findOne({ username: req.body.assignedTo });
                    service.assignedTo = {
                        username: newModerator.username,
                        userId: newModerator._id,
                        email: newModerator.email,
                    };
                    const associatedChatBox = await ChatBox.findOne({ serviceId: service._id });
                    associatedChatBox.participants = [newModerator._id, service.assignedFor.userId];
                    await associatedChatBox.save();
                }

                service.save(async (err, updatedService) => {
                    if (err) {
                        res.status(500).send({ message: err });
                        return;
                    } else {
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
        <a href="dashboard.codifyplus.com"> Login Now!</a>
        `;

                            const emailC = emailTemplate(contentForEmail);

                            const emailSubject = `Start-Up Kro - New Service Assigned!`

                            await sendEmail(updatedService.assignedTo.email, emailC, emailSubject);

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