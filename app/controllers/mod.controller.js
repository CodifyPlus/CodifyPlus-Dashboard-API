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
