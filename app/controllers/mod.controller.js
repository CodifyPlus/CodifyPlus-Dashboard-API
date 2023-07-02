const db = require("../models");
const User = db.user;
const Service = db.service;
const MessageBox = db.messageBox;
const NotificationBox = db.notificationBox;
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { emailTemplate } = require("../templates/emailTemplate");
const { sendEmail } = require("../config/emailer");

exports.getAllServicesMod = (req, res) => {
    const username = req.query.username;

    Service.find({ 'assignedTo.username': username }).exec((err, services) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        // Redacting fields
        const redactedServices = services.map(service => {
            const { assignedFor, cost, assignedTo, ...rest } = service.toObject();
            const redactedAssignedFor = assignedFor ? { ...assignedFor, email: undefined } : undefined;
            return { assignedFor: redactedAssignedFor, ...rest };
        });

        res.status(200).send(redactedServices);
    });
};

exports.editTrackStatusMod = (req, res) => {
    Service.findById(db.mongoose.Types.ObjectId(req.body.serviceId)).exec((err, service) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        } else {
            const pathwayId = req.body.pathwayId;
            const pathway = service.pathway.find((p) => p._id.toString() === pathwayId);
            pathway.status = !pathway.status;

            service.save((err, updatedService) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                } else {
                    // Redacting fields
                    const { cost, assignedFor, ...rest } = updatedService.toObject();
                    const redactedService = {
                        ...rest,
                        assignedFor: assignedFor ? { ...assignedFor, email: undefined } : undefined
                    };

                    res.status(200).send(redactedService);
                    return;
                }
            });
        }
    });
};

exports.addTrackMod = (req, res) => {
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
                approved: false,
                status: req.body.status,
                sendEmail: req.body.sendEmail,
            };

            service.pathway.push(newTrackPoint);

            service.save(async (err, updatedService) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                } else {

                    const contentForEmail = `
            Moderator have added a new track point to <b>"${updatedService.name}"</b>
            <br>
            <br>
            Status: <b>${updatedService.pathway[updatedService.pathway.length - 1].title}</b>
            <br>
            Description: ${updatedService.pathway[updatedService.pathway.length - 1].description}
            `;

                    const emailC = emailTemplate(contentForEmail);

                    const emailSubject = `Start-Up Kro - ${updatedService.name} - Status Update by Moderator!`

                    sendEmail('operation.startupkro@gmail.com', emailC, emailSubject);

                    res.status(200).send(updatedService);
                    return;
                }
            });
        }
    });
};

exports.addNoteMod = (req, res) => {
    Service.findById(db.mongoose.Types.ObjectId(req.body.serviceId)).exec((err, service) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        else {
            const newNote = {
                information: req.body.information,
                private: false,
                approved: false,
                createdAt: new Date(),
                sendEmail: req.body.sendEmail
            };

            service.notes.push(newNote);

            service.save(async (err, updatedService) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                } else {

                    const contentForEmail = `
            A new notification has been added to the service "${updatedService.name}" by Moderator
            <br>
            <br>
            Notification:
            <br>
            ${updatedService.notes[updatedService.notes.length - 1].information}
            `;

                    const emailC = emailTemplate(contentForEmail);

                    const emailSubject = `Start-Up Kro - ${updatedService.name} - Notification added by Moderator!`

                    sendEmail('operation.startupkro@gmail.com', emailC, emailSubject);
                    res.status(200).send(updatedService);
                    return;
                }
            });
        }
    });
};