const mongoose = require("mongoose");

const Template = mongoose.model(
    "Template",
    new mongoose.Schema({
        templateName: String,
        pathway: [{
            startedAt: {
                type: Date,
                default: undefined
            },
            description: String,
            title: String,
            status: Boolean,
            approved: Boolean,
            sendEmail: Boolean,
        }],
    })
);

module.exports = Template;
