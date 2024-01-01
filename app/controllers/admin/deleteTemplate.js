const db = require("../../models");
const Template = db.template;

exports.deleteTemplate = async (req, res) => {
    try {
        // Find and delete the template by ID
        const targetTemplate = await Template.findByIdAndDelete(req.body.templateId);

        if (!targetTemplate) {
            res.status(404).send({ message: "Template not found" });
            return;
        }

        res.status(200).send({ message: "Deleted!" });
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};
