const db = require("../../models");
const Template = db.template;

exports.getAllTemplates = async (req, res) => {
    try {
        // Fetch templates
        const templates = await Template.find({});

        // Send templates as response
        res.status(200).send(templates);
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).send({ message: error.message });
    }
};
