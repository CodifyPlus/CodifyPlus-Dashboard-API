const db = require("../../models");
const Template = db.template;

exports.addTemplateTrack = async (req, res) => {
    try {
        const templateId = db.mongoose.Types.ObjectId(req.body.templateId);

        // Find the template by ID
        const template = await Template.findById(templateId);

        if (!template) {
            res.status(404).send({ message: "Template not found" });
            return;
        }

        // Create a new track point
        const newTrackPoint = {
            description: req.body.description,
            title: req.body.title,
            startedAt: undefined,
            approved: true,
            status: false,
            sendEmail: false,
        };

        // Add the new track point to the template
        template.pathway.push(newTrackPoint);

        // Save the updated template
        const updatedtemplate = await template.save();

        res.status(200).send(updatedtemplate);
    } catch (err) {
        // Handle errors
        console.error(err);
        res.status(500).send({ message: err.message });
    }
};
