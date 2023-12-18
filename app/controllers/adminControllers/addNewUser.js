const db = require("../../models");
const User = db.user;
const NotificationBox = db.notificationBox;
var bcrypt = require("bcryptjs");
const { emailTemplate } = require("../../templates/emailTemplate");
const { sendEmail } = require("../../config/emailer");

exports.addNewUser = (req, res) => {
    try {
        const { username, email, password } = req.body;

        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8)
        });

        user.save(async (err, user) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
            const notificationBox = new NotificationBox({
                belongsTo: user.username,
                notifications: [],
            });
            user.role = "USER";
            await notificationBox.save();
            user.save(async (err) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }
                else {
                    //Send Email Logic

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
            <a href="dashboard.codifyplus.com"> Login Now!</a>
            `;

                        const emailC = emailTemplate(contentForEmail);

                        const emailSubject = `StartupKro - Account Created Successfully!`

                        sendEmail(email, emailC, emailSubject);

                    }

                    res.send({ message: "User was registered successfully!" });
                }
            });
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};