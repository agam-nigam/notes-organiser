const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 2525,
    secure: false,
    auth: {
        user: process.env.BREVO_EMAIL,
        pass: process.env.BREVO_SMTP_KEY
    }
});

const sendResetEmail = async (to, resetUrl) => {
    const info = await transporter.sendMail({
        from: "Notes Organiser <notesorganiserapp@gmail.com>",
        to,
        subject: "Notes Organiser - Password Reset Request",
        html: `
            <h2>Password Reset Request</h2>
            <p>
                You requested a password reset for your Notes Organiser account.
            </p>
            <p>
                Click the button below to reset your password:
            </p>
            <p>
                <a href="${resetUrl}">
                    Reset Password
                </a>
            </p>
            <p>
                This link will expire in 30 minutes.
            </p>
            <p>
                If you did not request this password reset,
                please ignore this email.
            </p>
        `
    });
    console.log("Email sent:", info.messageId);
};

module.exports = sendResetEmail;