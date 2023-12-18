const db = require("../models");
const User = db.user;
const Service = db.service;
const ChatBox = db.chatBox;
const { emailTemplate } = require("../templates/emailTemplate");
const { sendEmail } = require("../config/emailer");
const { novu } = require("../../server");
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { getAllUsers } = require("./adminControllers/getAllUsers");
const { changeUserRole } = require("./adminControllers/changeUserRole");
const { addNewUser } = require("./adminControllers/addNewUser");
const { getAllServices } = require("./adminControllers/getAllServices");
const { getAllUsernames } = require("./adminControllers/getAllUsernames");
const { getAllModerators } = require("./adminControllers/getAllModerators");
const { addNewService } = require("./adminControllers/addNewService");
const { addNote } = require("./adminControllers/addNote");
const { addTrack } = require("./adminControllers/addTrack");
const { editTrackStatus } = require("./adminControllers/editTrackStatus");
const { markAsCompleted } = require("./adminControllers/markAsCompleted");
const { deleteService } = require("./adminControllers/deleteService");
const { deleteUser } = require("./adminControllers/deleteUser");
const { sendNotification } = require("./adminControllers/sendNotification");

exports.getAllUsers = getAllUsers;
exports.changeUserRole = changeUserRole;
exports.addNewUser = addNewUser;
exports.getAllServices = getAllServices;
exports.getAllUsernames = getAllUsernames;
exports.getAllModerators = getAllModerators;
exports.addNewService = addNewService;
exports.addNote = addNote;
exports.addTrack = addTrack;
exports.editTrackStatus = editTrackStatus;
exports.markAsCompleted = markAsCompleted;
exports.deleteService = deleteService;
exports.deleteUser = deleteUser;
exports.sendNotification = sendNotification;

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