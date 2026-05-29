const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

const sendResetEmail = async (to, resetUrl) => {
    await resend.emails.send({
        from: "Notes Organiser <onboarding@resend.dev>",
        to: to,
        subject: "Password Reset Request",
        html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 30 minutes.</p>`
    });
};

module.exports = sendResetEmail;