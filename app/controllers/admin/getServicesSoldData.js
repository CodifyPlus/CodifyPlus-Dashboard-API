const db = require("../../models");
const Service = db.service;

exports.getServicesSoldData = async (req, res) => {
    try {
        // Aggregate pipeline to count the number of services sold for each service name
        const pipeline = [
            {
                $group: {
                    _id: "$name",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    serviceName: "$_id",
                    count: 1,
                    _id: 0
                }
            }
        ];

        // Execute the aggregation pipeline
        const servicesSoldData = await Service.aggregate(pipeline);

        // Send the aggregated data in the response
        res.status(200).send({
            data: servicesSoldData
        });
    } catch (err) {
        // Handle errors
        console.error(err);
        res.status(500).send({ message: err.message });
    }
};
