const { emailTemp } = require("../../helpers/email/emailTemp.js");

const brevoApiKey = (process.env.BREVO_API_KEY || "").trim();
const mailFrom = (process.env.MAIL_FROM || "").trim();
const formattedSender = mailFrom.match(/^(?:\"([^\"]+)\"|'([^']+)'|([^<]+))\s*<([^>]+)>$/);
const senderEmail = (formattedSender?.[4] || process.env.EMAIL_FROM || process.env.SENDER_EMAIL || "").trim();
const senderName = (formattedSender?.[1] || formattedSender?.[2] || formattedSender?.[3] || process.env.EMAIL_FROM_NAME || "Rent Nest").trim();
const notifyEmail = (process.env.NOTIFY_EMAIL || "").trim();

const sendEmail = async ({ email, subject, otp, resetLink, title, message, details }) => {
  if (!brevoApiKey || !senderEmail) {
    throw new Error("BREVO_API_KEY and MAIL_FROM (or EMAIL_FROM) are required to send email");
  }

  const recipient = (email || notifyEmail).trim();
  if (!recipient) throw new Error("Email recipient is required");

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": brevoApiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: recipient }],
      subject,
      htmlContent: emailTemp({ otp, resetLink, title, message, details }),
    }),
  });

  if (!response.ok) {
    const responseBody = await response.text();
    throw new Error(`Brevo email request failed (${response.status}): ${responseBody}`);
  }

  return true;
};

const mailSender = async ({ email, subject, otp, resetLink }) => {
  await sendEmail({ email, subject, otp, resetLink });
  console.log(`Email sent successfully to ${email || notifyEmail}`);
};

const sendNoticeEmail = async ({ email, subject, title, message, details }) => {
  if (!brevoApiKey || !senderEmail) return false;
  await sendEmail({ email, subject, title, message, details });
  return true;
};

module.exports = {
  mailSender,
  sendNoticeEmail,
};
