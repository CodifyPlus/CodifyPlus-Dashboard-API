const db = require("../models");
const User = db.user;
require("dotenv").config();
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { novu } = require("../../server");
const NotificationBox = db.notificationBox;
const { PushProviderIdEnum } = require("@novu/node");
const crypto = require("crypto");
const { sendEmail } = require("../config/emailer");
const { emailTemplate } = require("../templates/emailTemplate");

exports.signup = (req, res) => {
  const user = new User({
    fullname: req.body.fullname,
    username: req.body.username.toLowerCase(),
    email: req.body.email.toLowerCase(),
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
    user.save(async err => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      await novu.subscribers.identify(req.body.username.toLowerCase(), {
        username: req.body.username.toLowerCase(),
      });
      res.send({ message: "User was registered successfully!" });
    });
  });
};

exports.signin = async (req, res) => {
  User.findOne({
    username: req.body.username.toLowerCase()
  })
    .exec(async (err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      var token = jwt.sign({ id: user.id }, process.env.SECRET, {
        expiresIn: 2678400 // 24 hours
      });
      await novu.subscribers.identify(req.body.username.toLowerCase(), {
        username: req.body.username.toLowerCase()
      });
      await novu.subscribers.setCredentials(req.body.username.toLowerCase(), PushProviderIdEnum.OneSignal, {
        deviceTokens: [req.body.player_id],
      });
      res.status(200).send({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        accessToken: token
      });
    });
};


exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.resetPasswordToken && user.resetPasswordExpires > Date.now()) {
      return res.status(400).json({ message: "Password reset email already sent, Please wait for the previous one to expire" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 1800000; // Token expires in 30 minutes

    await user.save();

    // Send an email with a link containing the resetToken
    const contentForEmail = `
                Please use this link to securely reset your password. This link will remain active for <b>30 minutes</b>. This email is intended for <b>${user.username}</b>'s account associated with StartupKro.
                <br>
                <br>
                <b>Please note, your new password must contain at least 8 characters, including an uppercase letter, a lowercase letter, and a number.</b>
                <br>
                <br>
                <a href="https://dashboard.StartupKro.com/reset-password/${resetToken}">Reset Password</a>
                <br>
                <br>
                If you did not request a password reset, please ignore this email.
            `;
    const emailContent = emailTemplate(contentForEmail);
    const emailSubject = `Start-Up Kro - Forgot Password!`;
    sendEmail(user.email, emailContent, emailSubject);

    return res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.body.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/.test(req.body.newPassword)) {
      return res.status(400).send({ message: "The password must contain at least one uppercase, lowercase, symbol, and a number, and length must be more than 8 characters" });
    }

    if (req.body.confirmNewPassword !== req.body.newPassword) {
      return res.status(400).send({ message: "Passwords do not match" });
    }

    // Set the new password
    user.password = bcrypt.hashSync(req.body.newPassword, 8);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};