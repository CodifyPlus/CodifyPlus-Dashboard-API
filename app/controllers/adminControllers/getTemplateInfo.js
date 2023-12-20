const db = require("../../models");
const Template = db.template;

exports.getTemplateInfo = async (req, res) => {
    try {
        // Fetch requested template
        const template = await Template.findById(db.mongoose.Types.ObjectId(req.query.templateId));

        // Send the response
        res.status(200).send(template);
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).send({ message: error.message });
    }
};