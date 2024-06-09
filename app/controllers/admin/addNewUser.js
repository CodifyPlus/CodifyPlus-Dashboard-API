const db = require("../../models");
const User = db.user;
const bcrypt = require("bcryptjs");
const { emailTemplate } = require("../../templates/emailTemplate");
const { sendEmail } = require("../../config/emailer");

exports.addNewUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Hash the password
        const hashedPassword = bcrypt.hashSync(password, 8);

        // Create a new User instance
        const user = new User({
            username,
            email,
            password: hashedPassword,
            role: "USER"
        });

        // Save the user
        await user.save();

        // Send email if requested
        if (req.body.sendEmail) {
            const contentForEmail = `
                Your account details for logging into the StartupKro Dashboard are:
                <br>
                <br>
                Username: <b>${username}</b>
                <br>
                Email: <b>${email}</b>
                <br>
                Password: <b>${password}</b>
                <br>
                <br>
                <a href="dashboard.StartupKro.com"> Login Now!</a>
            `;

            const emailContent = emailTemplate(contentForEmail);
            const emailSubject = `StartupKro - Account Created Successfully!`;

            sendEmail(email, emailContent, emailSubject);
        }

        res.send({ message: "User was registered successfully!" });
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).send({ message: error.message });
    }
};
