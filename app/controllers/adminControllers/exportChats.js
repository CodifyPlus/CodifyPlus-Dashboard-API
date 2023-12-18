const db = require("../../models");
const ChatBox = db.chatBox;
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

exports.exportChats = async (req, res) => {
    const getCsvHeader = () => {
        const chatSchema = ChatBox.schema.obj;
        return Object.keys(chatSchema).map((field) => ({ id: field, title: field }));
    };

    try {
        // Fetch all chats from the database
        const chats = await ChatBox.find();

        // Define the CSV file path
        const csvFilePath = 'chats.csv';

        // Create a CSV writer with dynamically generated header
        const csvWriter = createCsvWriter({
            path: csvFilePath,
            header: getCsvHeader(),
        });

        // Write chats to the CSV file
        await csvWriter.writeRecords(chats);

        // Send the CSV file as a response to the frontend
        res.download(csvFilePath, 'chats.csv', (err) => {
            // Delete the CSV file after sending the response
            fs.unlinkSync(csvFilePath);
            if (err) {
                console.error('Error sending CSV file:', err);
            }
        });
    } catch (error) {
        console.error('Error exporting chats to CSV:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}