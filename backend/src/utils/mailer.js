const nodemailer = require("nodemailer");

const isGmail = (process.env.SMTP_USER || process.env.SMTP_USERNAME || "").includes("@gmail.com");

const transporter = nodemailer.createTransport({
  host: isGmail ? "smtp.gmail.com" : "smtp-relay.brevo.com",
  port: isGmail ? 465 : 587,
  secure: isGmail,
  auth: {
    user: process.env.SMTP_USER || process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD,
  },
});

module.exports = transporter;