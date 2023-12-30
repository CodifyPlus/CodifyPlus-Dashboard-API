const db = require("../../models");
const Template = db.template

exports.addTemplate = async (req, res) => {
    try {
        const { templateName } = req.body;

        // Create a new template instance
        const template = new Template({
            templateName,
            pathway: [],
        });

        // Save the template
        const savedTemplate = await template.save();

        // Send the service ID in the response
        res.status(200).send(savedTemplate._id);
    } catch (err) {
        // Handle errors
        console.error(err);
        res.status(500).send({ message: err.message });
    }
};
