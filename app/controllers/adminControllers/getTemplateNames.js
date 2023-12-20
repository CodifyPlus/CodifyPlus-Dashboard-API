const db = require("../../models");
const Template = db.template;

exports.getTemplateNames = async (req, res) => {
    try {
        // Find all template names
        const templates = await Template.find({}, "templateName").exec();

        // Map the templateNames for response
        const templateNames = templates.map(temp => ({
            value: temp.templateName,
            label: temp.templateName
        }));

        // Send the response
        res.status(200).send(templateNames);
    } catch (err) {
        // Handle errors
        console.error(err);
        res.status(500).send({ message: err.message });
    }
};
