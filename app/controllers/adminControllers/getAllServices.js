const db = require("../../models");
const Service = db.service;

exports.getAllServices = (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        // Fetch services
        Service.find({})
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .exec((err, services) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }

                // Count total services
                Service.countDocuments({}, (countErr, totalCount) => {
                    if (countErr) {
                        res.status(500).send({ message: countErr });
                        return;
                    }

                    // Send both services and total count in the response
                    res.status(200).send({
                        services,
                        total: totalCount,
                    });
                });
            });
    }
    catch (err) {
        res.status(500).send({ message: err.message });
        return;
    }
};