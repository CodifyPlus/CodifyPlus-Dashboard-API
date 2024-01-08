const db = require("../../models");
const User = db.user;

exports.getAllUsers = async (req, res) => {
    try {
        let { page = 1, limit = 10, search = "", advancedSearch = false } = req.query;
        advancedSearch === "true" ? advancedSearch = true : advancedSearch = false;

        let searchQuery = {
            $or: [
                { username: { $regex: new RegExp(search, "i") } },
                { role: { $regex: new RegExp(search, "i") } },
                { email: { $regex: new RegExp(search, "i") } },
                { status: { $regex: new RegExp(search, "i") } },
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

        // Fetch users with pagination
        const users = await User.find(searchQuery)
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .exec();

        // Count total users
        const totalCount = await User.countDocuments(searchQuery).exec();

        // Send both users and total count in the response
        res.status(200).send({
            users,
            total: totalCount,
        });
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).send({ message: error.message });
    }
};
