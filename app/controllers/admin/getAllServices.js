const db = require("../../models");
const Service = db.service;

exports.getAllServices = async (req, res) => {
    try {
        let { page = 1, limit = 10, search = "", advancedSearch = false } = req.query;
        advancedSearch === "true" ? advancedSearch = true : advancedSearch = false;

        let searchQuery = {
            $or: [
                { name: { $regex: new RegExp(search, "i") } },
                { status: { $regex: new RegExp(search, "i") } },
                { cost: { $regex: new RegExp(search, "i") } },
                { duration: { $regex: new RegExp(search, "i") } },
                { "assignedTo.username": { $regex: new RegExp(search, "i") } },
                { "assignedTo.email": { $regex: new RegExp(search, "i") } },
                { "assignedFor.username": { $regex: new RegExp(search, "i") } },
                { "assignedFor.email": { $regex: new RegExp(search, "i") } },
            ],
        };

        if (advancedSearch === true && search !== "" && search.includes('&')) {
            const criteriaList = search.split('&');

            searchQuery = {
                $and: criteriaList.map(criteria => {
                    const [field, operator, value] = criteria.trim().split(':');
                    const regexValue = new RegExp(value, 'i');

                    switch (operator) {
                        case 'eq':
                            return { [field]: value };
                        case 'contains':
                            return { [field]: { $regex: regexValue } };
                        default:
                            return { [field]: { $regex: regexValue } };
                    }
                }),
            };
        }

        else if (advancedSearch === true && search !== "") {
            searchQuery = {
                $or: search.split(',').map(criteria => {
                    const [field, operator, value] = criteria.split(':');
                    const regexValue = new RegExp(value, 'i');

                    switch (operator) {
                        case 'eq':
                            return { [field]: value };
                        case 'contains':
                            return { [field]: { $regex: regexValue } };
                        default:
                            return { [field]: { $regex: regexValue } };
                    }
                }),
            };
        }

        // Fetch services with pagination
        const services = await Service.find(searchQuery)
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .exec();

        // Count total services
        const totalCount = await Service.countDocuments(searchQuery).exec();

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
