const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    },

    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
});

transporter.verify((err, success) => {

    if (err) {
        console.log("Mail Error:", err);
    } else {
        console.log("Mail Server Ready");
    }

});

module.exports = transporter;