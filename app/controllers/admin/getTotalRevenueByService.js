const db = require("../../models");
const Service = db.service;

exports.getTotalRevenueByService = async (req, res) => {
    try {
        // Aggregate pipeline to calculate total revenue for each service
        const pipeline = [
            {
                $group: {
                    _id: "$name",
                    totalRevenue: { $sum: { $toDouble: "$cost" } }
                }
            },
            {
                $project: {
                    serviceName: "$_id",
                    totalRevenue: 1,
                    _id: 0
                }
            }
        ];

        // Execute the aggregation pipeline
        const revenueData = await Service.aggregate(pipeline);

        // Send the aggregated data in the response
        res.status(200).send({
            data: revenueData
        });
    } catch (err) {
        // Handle errors
        console.error(err);
        res.status(500).send({ message: err.message });
    }
};
