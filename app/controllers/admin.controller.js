const db = require("../models");
const User = db.user;
const Service = db.service;
const ChatBox = db.chatBox;
const NotificationBox = db.notificationBox;
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { emailTemplate } = require("../templates/emailTemplate");
const { sendEmail } = require("../config/emailer");
const { novu } = require("../../server");
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

exports.getAllUsers = (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    // Fetch users
    User.find({})
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .exec((err, users) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }

            // Count total services
            User.countDocuments({}, (countErr, totalCount) => {
                if (countErr) {
                    res.status(500).send({ message: countErr });
                    return;
                }

                // Send both services and total count in the response
                res.status(200).send({
                    users,
                    total: totalCount,
                });
            });
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
            <a href="dashboard.codifyplus.com"> Login Now!</a>
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
    const { page = 1, limit = 10 } = req.query;

    // Fetch services
    Service.find({})
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .exec((err, services) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }

            // Count total services
            Service.countDocuments({}, (countErr, totalCount) => {
                if (countErr) {
                    res.status(500).send({ message: countErr });
                    return;
                }

                // Send both services and total count in the response
                res.status(200).send({
                    services,
                    total: totalCount,
                });
            });
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
                        const filteredArray = user.processServices.filter(obj => obj.serviceId.toString() !== updatedService._id.toString());
                        user.processServices = filteredArray;
                    }
                    if (containsRequiredServiceId) {
                        const filteredArray = user.completedServices.filter(obj => obj.serviceId.toString() !== updatedService._id.toString());
                        user.completedServices = filteredArray;
                        user.processServices.push({
                            serviceId: updatedService._id,
                            name: updatedService.name,
                        });
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
    try {
        // Find the user by ID
        const targetUser = await User.findByIdAndDelete(req.body.userId);

        // Delete chatboxes where user's ID is in the participants array
        if (targetUser.role === 'USER') {
            await ChatBox.deleteMany({ participants: targetUser._id });
        }

        await Service.deleteMany({ 'assignedFor.userId': targetUser._id });

        res.status(200).send({ message: "Deleted!" });
    } catch (error) {
        console.error("Error deleting user and chatboxes:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

exports.sendNotification = async (req, res) => {

    try {
        novu.trigger('codifyplus', {
            to: {
                subscriberId: req.body.username,
            },
            payload: {
                description: req.body.content,
            }
        });
        res.status(200).json("Notification sent!");
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

    /*
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
    */
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
            note.approved = !note.approved;
            const indexOfNote = service.notes.findIndex((n) => n._id.toString() === noteId);
            service.save(async (err, updatedService) => {
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

exports.getSubscribedChatBoxes = async (req, res) => {
    try {
        const userId = req.userId;

        const chatBoxes = await ChatBox.find({});

        const chatBoxesWithMessageSize = chatBoxes.map((chatBox) => {
            const { serviceName, assignedFor, serviceId, _id, messages } = chatBox;
            const noOfMessages = messages ? messages.length : 0;
            return { serviceName, assignedFor, serviceId, _id, noOfMessages };
        });

        res.status(200).json({ chatBoxes: chatBoxesWithMessageSize });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getAdminStats = (req, res) => {
    // Find all services
    Service.find({}).exec((err, services) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        // Extract relevant information from each service
        const completedServices = [];
        const pendingServices = [];
        const processServices = [];

        services.forEach(service => {
            const serviceInfo = {
                serviceId: service._id,
                name: service.name,
                username: service.assignedFor.username,
                // Add other relevant fields as needed
            };

            // Categorize services based on their status
            if (service.status === 'Completed') {
                completedServices.push(serviceInfo);
            } else if (service.status === 'Process') {
                pendingServices.push(serviceInfo);
            } else {
                processServices.push(serviceInfo);
            }
        });

        // Create the response object
        const adminStats = {
            completedServices,
            pendingServices,
            processServices,
        };

        // Send the response
        res.status(200).send(adminStats);
    });
};

exports.toggleTimelineDatesVisibility = async (req, res) => {
    try {
        // Find the service by ID
        const targetService = await Service.findById(req.body.serviceId);

        // Toggle the visibility of timeline dates
        targetService.timelineDatesIsVisible = targetService.timelineDatesIsVisible !== undefined ? !targetService.timelineDatesIsVisible : false;

        const updatedService = await targetService.save();
        res.status(200).send(updatedService);
    } catch (error) {
        console.error("Error toggling dates!:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

exports.sendNoteEmail = (req, res) => {
    Service.findById(db.mongoose.Types.ObjectId(req.body.serviceId)).exec((err, service) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        else {
            const noteId = req.body.noteId;
            const indexOfNote = service.notes.findIndex((n) => n._id.toString() === noteId);
            const contentForEmail = `
                        A new notification has been added to your service "${service.name}"
                        <br>
                        <br>
                        Notification:
                        <br>
                        ${service.notes[indexOfNote].information}
            `;

            const emailC = emailTemplate(contentForEmail);

            const emailSubject = `Start-Up Kro - ${service.name} - Notification!`

            sendEmail(service.assignedFor.email, emailC, emailSubject);

            res.status(200).send("Note Sent!");
        }
    });
};

exports.getUserStatsForAdmin = (req, res) => {
    User.findById(req.query.userId).exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        else {
            res.status(200).send(user);
            return;
        }
    });
};

exports.editServiceDetails = async (req, res) => {
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
};

exports.editTrack = (req, res) => {
    Service.findById(db.mongoose.Types.ObjectId(req.body.serviceId)).exec((err, service) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        else {
            const pathwayId = req.body.pathwayId;
            const pathway = service.pathway.find((p) => p._id.toString() === pathwayId);
            pathway.title = req.body.title;
            pathway.description = req.body.description;
            pathway.startedAt = req.body.startedAt;
            service.save(async (err, updatedService) => {
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

exports.exportUsers = async (req, res) => {
    const getCsvHeader = () => {
        const userSchema = User.schema.obj;
        return Object.keys(userSchema).map((field) => ({ id: field, title: field }));
    };

    try {
        // Fetch all users from the database
        const users = await User.find();

        // Define the CSV file path
        const csvFilePath = 'users.csv';

        // Create a CSV writer with dynamically generated header
        const csvWriter = createCsvWriter({
            path: csvFilePath,
            header: getCsvHeader(),
        });

        // Write users to the CSV file
        await csvWriter.writeRecords(users);

        // Send the CSV file as a response to the frontend
        res.download(csvFilePath, 'users.csv', (err) => {
            // Delete the CSV file after sending the response
            fs.unlinkSync(csvFilePath);
            if (err) {
                console.error('Error sending CSV file:', err);
            }
        });
    } catch (error) {
        console.error('Error exporting users to CSV:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

exports.exportChats = async (req, res) => {
    const getCsvHeader = () => {
        const chatSchema = ChatBox.schema.obj;
        return Object.keys(chatSchema).map((field) => ({ id: field, title: field }));
    };

    try {
        // Fetch all chats from the database
        const chats = await ChatBox.find();

        // Define the CSV file path
        const csvFilePath = 'chats.csv';

        // Create a CSV writer with dynamically generated header
        const csvWriter = createCsvWriter({
            path: csvFilePath,
            header: getCsvHeader(),
        });

        // Write chats to the CSV file
        await csvWriter.writeRecords(chats);

        // Send the CSV file as a response to the frontend
        res.download(csvFilePath, 'chats.csv', (err) => {
            // Delete the CSV file after sending the response
            fs.unlinkSync(csvFilePath);
            if (err) {
                console.error('Error sending CSV file:', err);
            }
        });
    } catch (error) {
        console.error('Error exporting chats to CSV:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

exports.exportServices = async (req, res) => {
    const getCsvHeader = () => {
        const serviceSchema = Service.schema.obj;
        return Object.keys(serviceSchema).map((field) => ({ id: field, title: field }));
    };

    try {
        // Fetch all services from the database
        const services = await Service.find();

        // Define the CSV file path
        const csvFilePath = 'services.csv';

        // Create a CSV writer with dynamically generated header
        const csvWriter = createCsvWriter({
            path: csvFilePath,
            header: getCsvHeader(),
        });

        // Write services to the CSV file
        await csvWriter.writeRecords(services);

        // Send the CSV file as a response to the frontend
        res.download(csvFilePath, 'services.csv', (err) => {
            // Delete the CSV file after sending the response
            fs.unlinkSync(csvFilePath);
            if (err) {
                console.error('Error sending CSV file:', err);
            }
        });
    } catch (error) {
        console.error('Error exporting services to CSV:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}