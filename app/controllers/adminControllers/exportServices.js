const db = require("../../models");
const Service = db.service;
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

exports.exportServices = async (req, res) => {
    const getCsvHeader = () => {
        const serviceSchema = Service.schema.obj;
        return Object.keys(serviceSchema).map((field) => ({ id: field, title: field }));
    };

    try {
        // Fetch all services from the database
        const services = await Service.find();

        // Define the CSV file path
        const csvFilePath = 'services.csv';

        // Create a CSV writer with dynamically generated header
        const csvWriter = createCsvWriter({
            path: csvFilePath,
            header: getCsvHeader(),
        });

        // Write services to the CSV file
        await csvWriter.writeRecords(services);

        // Send the CSV file as a response to the frontend
        res.download(csvFilePath, 'services.csv', (err) => {
            // Delete the CSV file after sending the response
            fs.unlinkSync(csvFilePath);
            if (err) {
                console.error('Error sending CSV file:', err);
            }
        });
    } catch (error) {
        console.error('Error exporting services to CSV:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}