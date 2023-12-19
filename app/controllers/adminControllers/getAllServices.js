const db = require("../../models");
const Service = db.service;

exports.getAllServices = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        // Fetch services with pagination
        const services = await Service.find({})
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .exec();

        // Count total services
        const totalCount = await Service.countDocuments({}).exec();

        // Send both services and total count in the response
        res.status(200).send({
            services,
            total: totalCount,
        });
    } catch (err) {
        // Handle errors
        console.error(err);
        res.status(500).send({ message: err.message });
    }
};
