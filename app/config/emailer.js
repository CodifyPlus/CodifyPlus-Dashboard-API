const nodemailer = require('nodemailer');

async function sendEmail(userEmail, htmlContent, emailSubject) {
  try {
    // Create a SMTP transporter using your SMTP settings
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 465,
      secure: true, // Set to false if your SMTP server doesn't require SSL
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Define the email options
    const mailOptions = {
      from: process.env.SMTP_USER, // Sender's email address
      to: userEmail, // Recipient's email address
      subject: emailSubject,
      html: htmlContent,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

exports.sendEmail = sendEmail;