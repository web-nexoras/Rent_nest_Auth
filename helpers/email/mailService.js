const nodemailer = require("nodemailer");
const { emailTemp } = require("../../helpers/email/emailTemp.js");

const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = (process.env.SMTP_USER || "").trim();
const smtpPass = (process.env.SMTP_PASS || "").trim();
const notifyEmail = (process.env.NOTIFY_EMAIL || "").trim();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: smtpPort,
  secure: smtpPort === 465,
  requireTLS: smtpPort === 587,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

const sendEmail = async ({ email, subject, otp, resetLink, title, message, details }) => {
  if (!smtpUser || !smtpPass) {
    throw new Error("SMTP_USER and SMTP_PASS are required; use a Gmail App Password for SMTP_PASS");
  }

  const recipient = (email || notifyEmail).trim();
  if (!recipient) throw new Error("Email recipient is required");

  await transporter.sendMail({
    from: `"Rent Nest" <${smtpUser}>`,
    to: recipient,
    subject,
    html: emailTemp({ otp, resetLink, title, message, details }),
  });
  return true;
};

const mailSender = async ({ email, subject, otp, resetLink }) => {
  await sendEmail({ email, subject, otp, resetLink });
  console.log(`Email sent successfully to ${email || notifyEmail}`);
};

const sendNoticeEmail = async ({ email, subject, title, message, details }) => {
  if (!smtpUser || !smtpPass) return false;
  await sendEmail({ email, subject, title, message, details });
  return true;
};

module.exports = {
  mailSender,
  sendNoticeEmail,
};