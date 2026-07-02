require('dotenv').config();

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: process.env.MAILER_USER,
        pass: process.env.MAILERPASS
    }
});

const sendMail = async (to, subject, text, html) => {
    try {
        const mail = {
            from: process.env.MAILER_USER,
            to: to,
            subject: subject,
            text: text
        };

        // send an HTML body when provided so Hebrew (RTL) renders correctly
        if (html) {
            mail.html = html;
        }

        const info = await transporter.sendMail(mail);

        console.log("Mail sent:", info.response);
    } catch (err) {
        console.log("Mail error:", err);
    }
};

module.exports = sendMail;
