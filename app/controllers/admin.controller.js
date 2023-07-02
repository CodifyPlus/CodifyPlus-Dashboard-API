const db = require("../models");
const User = db.user;
const Service = db.service;
const MessageBox = db.messageBox;
const NotificationBox = db.notificationBox;
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { emailTemplate } = require("../templates/emailTemplate");
const { sendEmail } = require("../config/emailer");

exports.getAllUsers = (req, res) => {
    User.find({}).exec((err, users) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        else {
            res.status(200).send(users);
            return;
        }
    });
};

exports.changeUserRole = (req, res) => {
    const { newRole, userId } = req.body;
    User.findByIdAndUpdate(userId, { role: newRole },
        function (err, docs) {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
            else {
                res.status(204);
            }
        });
};

exports.addNewUser = (req, res) => {
    const { username, email, password } = req.body;

    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8)
    });

    user.save(async (err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        const notificationBox = new NotificationBox({
            belongsTo: user.username,
            notifications: [],
        });
        user.role = "USER";
        await notificationBox.save();
        user.save(async (err) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
            else {
                //Send Email Logic

                if (req.body.sendEmail) {
                    const contentForEmail = `
            Your account details for logging into the StartupKro Dashboard are:
            <br>
            <br>
            Username: <b>${username}</b>
            <br>
            Email: <b>${email}</b>
            <br>
            Password: <b>${password}</b>
            <br>
            <br>
            <a href="m.codifyplus.com"> Login Now!</a>
            `;

                    const emailC = emailTemplate(contentForEmail);

                    const emailSubject = `StartupKro - Account Created Successfully!`

                    sendEmail(email, emailC, emailSubject);

                }

                res.send({ message: "User was registered successfully!" });
            }
        });
    });
};

exports.getAllServices = (req, res) => {
    Service.find({}).exec((err, services) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        else {
            res.status(200).send(services);
            return;
        }
    });
};

exports.getAllUsernames = (req, res) => {
    User.find({}, "username").exec((err, users) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        else {
            const usernames = users.map(user => {
                return {
                    value: user.username,
                    label: user.username
                }
            });
            res.status(200).send(usernames);
            return;
        }
    });
};

exports.getAllModerators = (req, res) => {
    User.find({ role: { $in: ['MODERATOR', 'ADMIN'] } }, "username").exec((err, moderators) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        else {
            const usernames = moderators.map(user => {
                return {
                    value: user.username,
                    label: user.username
                }
            });
            res.status(200).send(usernames);
            return;
        }
    });
};

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
        <a href="m.codifyplus.com"> Login Now!</a>
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
        <a href="m.codifyplus.com"> Login Now!</a>
        `;

            const emailC = emailTemplate(contentForEmail);

            const emailSubject = `Start-Up Kro - New Service Assigned!`

            await sendEmail(service.assignedTo.email, emailC, emailSubject);

        }

        res.status(200).send(service._id);
    });
};

exports.addNote = (req, res) => {
    Service.findById(db.mongoose.Types.ObjectId(req.body.serviceId)).exec((err, service) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        else {
            const newNote = {
                information: req.body.information,
                private: req.body.private,
                approved: true,
                createdAt: new Date()
            };

            service.notes.push(newNote);

            service.save(async (err, updatedService) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                } else {

                    if (req.body.sendEmail) {
                        const contentForEmail = `
            A new notification has been added to your service "${updatedService.name}"
            <br>
            <br>
            Notification:
            <br>
            ${updatedService.notes[updatedService.notes.length - 1].information}
            `;

                        const emailC = emailTemplate(contentForEmail);

                        const emailSubject = `Start-Up Kro - ${updatedService.name} - Notification!`

                        sendEmail(updatedService.assignedFor.email, emailC, emailSubject);

                    }

                    res.status(200).send(updatedService);
                    return;
                }
            });
        }
    });
};

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

exports.editTrackStatus = (req, res) => {
    Service.findById(db.mongoose.Types.ObjectId(req.body.serviceId)).exec((err, service) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        else {
            const pathwayId = req.body.pathwayId;
            const pathway = service.pathway.find((p) => p._id.toString() === pathwayId);
            pathway.status = !pathway.status;

            service.save((err, updatedService) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                } else {
                    res.status(200).send(updatedService);
                    return;
                }
            });
        }
    });
};

exports.markAsCompleted = (req, res) => {
    Service.findById(db.mongoose.Types.ObjectId(req.body.serviceId)).exec((err, service) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        else {
            service.status = service.status === "Pending" ? "Completed" : "Pending";
            service.save(async (err, updatedService) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                } else {
                    const user = await User.findOne({ username: updatedService.assignedFor.username });
                    const containsRequiredServiceId = user.completedServices.some(obj => obj.serviceId.toString() === updatedService._id.toString());
                    if (!containsRequiredServiceId) {
                        user.completedServices.push({
                            serviceId: updatedService._id,
                            name: updatedService.name,
                        });
                    }
                    if (!containsRequiredServiceId) {
                        const filteredArray = user.processServices.filter(obj => obj.serviceId.toString() !== updatedService._id.toString());
                        user.processServices = filteredArray;
                    }
                    user.save(err => {
                        if (err) {
                            res.status(500).send({ message: err });
                            return;
                        }
                        else {
                            res.status(200).send(updatedService);
                            return;
                        }
                    });

                }
            });
        }
    });
};

exports.deleteService = async (req, res) => {
    const targetService = await Service.findById(req.body.serviceId);
    const targetUser = await User.findOne({ username: targetService.assignedFor.username });

    const processIndex = targetUser.processServices.findIndex(service => service.serviceId.toString() === req.body.serviceId);
    const completeIndex = targetUser.completedServices.findIndex(service => service.serviceId.toString() === req.body.serviceId);

    targetUser.processServices.splice(processIndex, 1);
    targetUser.completedServices.splice(completeIndex, 1);

    await Service.findByIdAndDelete(req.body.serviceId);

    await targetUser.save();

    res.status(200).send({ message: "Deleted!" });
};

exports.deleteUser = async (req, res) => {
    await User.findByIdAndDelete(req.body.userId);
    res.status(200).send({ message: "Deleted!" });
};

exports.sendNotification = async (req, res) => {

    const targetUser = await User.findOne({ username: req.body.username });

    NotificationBox.findOne({ belongsTo: req.body.username }).exec(async (err, notificationBox) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        else {
            if (!notificationBox) {
                const newNotificationBox = new NotificationBox({
                    belongsTo: req.query.username,
                    notifications: [],
                });
                await newNotificationBox.save();
            }
            const newNotification = {
                title: req.body.title,
                content: req.body.content,
                createdAt: new Date()
            };

            if (notificationBox) {

                notificationBox.notifications.push(newNotification);

                notificationBox.save(async (err, updatedNotificationBox) => {
                    if (err) {
                        res.status(500).send({ message: err });
                        return;
                    } else {

                        if (req.body.sendEmail) {
                            const contentForEmail = `
                  You have received a new notification from Start-up Kro
                  <br>
                  <br>
                  Notification:
                  <br>
                  ${updatedNotificationBox.notifications[updatedNotificationBox.notifications.length - 1].content}
                  `;

                            const emailC = emailTemplate(contentForEmail);

                            const emailSubject = `Start-Up Kro - New Notification!`

                            await sendEmail(targetUser.email, emailC, emailSubject);

                        }

                        res.status(200).send(updatedNotificationBox);
                        return;
                    }
                });
            }
            else {
                newNotificationBox.notifications.push(newNotification);

                newNotificationBox.save(async (err, updatedNotificationBox) => {
                    if (err) {
                        res.status(500).send({ message: err });
                        return;
                    } else {

                        if (req.body.sendEmail) {
                            const contentForEmail = `
                  You have received a new notification from Start-up Kro
                  <br>
                  <br>
                  Notification:
                  <br>
                  ${updatedNotificationBox.notifications[updatedNotificationBox.notifications.length - 1].content}
                  `;

                            const emailC = emailTemplate(contentForEmail);

                            const emailSubject = `Start-Up Kro - New Notification!`

                            sendEmail(targetUser.email, emailC, emailSubject);

                        }

                        res.status(200).send(updatedNotificationBox);
                        return;
                    }
                });
            }

        }
    });
};

exports.approveTrack = (req, res) => {
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
};

exports.approveNote = (req, res) => {
    Service.findById(db.mongoose.Types.ObjectId(req.body.serviceId)).exec((err, service) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        else {
            const noteId = req.body.noteId;
            const note = service.notes.find((n) => n._id.toString() === noteId);
            const toSendEmail = note.sendEmail;
            note.sendEmail = false;
            note.approved = !note.approved;
            const indexOfNote = service.notes.findIndex((n) => n._id.toString() === noteId);
            service.save(async (err, updatedService) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                } else {
                    if (toSendEmail) {
                        const contentForEmail = `
                        A new notification has been added to your service "${updatedService.name}"
                        <br>
                        <br>
                        Notification:
                        <br>
                        ${updatedService.notes[indexOfNote].information}
            `;

                        const emailC = emailTemplate(contentForEmail);

                        const emailSubject = `Start-Up Kro - ${updatedService.name} - Notification!`

                        sendEmail(updatedService.assignedFor.email, emailC, emailSubject);

                    }
                    res.status(200).send(updatedService);
                    return;
                }
            });
        }
    });
};
