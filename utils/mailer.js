require('dotenv').config();

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: process.env.MAILER_USER,
        pass: process.env.MAILERPASS
    }
});

const sendMail = async (to, subject, text) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.MAILER_USER,
            to: to,
            subject: subject,
            text: text
        });

        console.log("Mail sent:", info.response);
    } catch (err) {
        console.log("Mail error:", err);
    }
};

module.exports = sendMail;