const db = require("../../models");
const User = db.user;
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

exports.exportUsers = async (req, res) => {
    const getCsvHeader = () => {
        const userSchema = User.schema.obj;
        return Object.keys(userSchema).map((field) => ({ id: field, title: field }));
    };

    try {
        // Fetch all users from the database
        const users = await User.find();

        // Define the CSV file path
        const csvFilePath = 'users.csv';

        // Create a CSV writer with dynamically generated header
        const csvWriter = createCsvWriter({
            path: csvFilePath,
            header: getCsvHeader(),
        });

        // Write users to the CSV file
        await csvWriter.writeRecords(users);

        // Send the CSV file as a response to the frontend
        res.download(csvFilePath, 'users.csv', (err) => {
            // Delete the CSV file after sending the response
            fs.unlinkSync(csvFilePath);
            if (err) {
                res.status(500).send({ message: err.message });
            }
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
}