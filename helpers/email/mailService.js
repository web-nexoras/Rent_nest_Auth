const nodemailer = require("nodemailer");
const { emailTemp } = require("./emailTemp.js");

const getSenderDetails = () => {
  const mailFrom = (process.env.MAIL_FROM || "").trim();
  const formattedSender = mailFrom.match(/^(?:\"([^\"]+)\"|'([^']+)'|([^<]+))\s*<([^>]+)>$/);
  const senderEmail = (
    formattedSender?.[4] ||
    process.env.SMTP_USER ||
    process.env.EMAIL_FROM ||
    process.env.SENDER_EMAIL ||
    "webnexoras.bd@gmail.com"
  ).trim();
  const senderName = (
    formattedSender?.[1] ||
    formattedSender?.[2] ||
    formattedSender?.[3] ||
    process.env.EMAIL_FROM_NAME ||
    "Rent Nest"
  ).trim();
  return { senderEmail, senderName };
};

const sendViaSmtp = async ({ recipient, subject, htmlContent }) => {
  const smtpUser = (process.env.SMTP_USER || "webnexoras.bd@gmail.com").trim();
  const smtpPass = (process.env.SMTP_PASS || "lmwl nuqw anek wzjo").trim();
  if (!smtpUser || !smtpPass) return false;

  const { senderEmail, senderName } = getSenderDetails();
  const port = Number(process.env.SMTP_PORT || 587);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  await transporter.sendMail({
    from: `"${senderName}" <${senderEmail}>`,
    to: recipient,
    subject,
    html: htmlContent,
  });

  return true;
};

const sendViaBrevo = async ({ recipient, subject, htmlContent }) => {
  const brevoApiKey = (process.env.BREVO_API_KEY || "").trim();
  const { senderEmail, senderName } = getSenderDetails();
  if (!brevoApiKey || !senderEmail) return false;

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
      htmlContent,
    }),
  });

  if (!response.ok) {
    const responseBody = await response.text();
    throw new Error(`Brevo API error (${response.status}): ${responseBody}`);
  }

  return true;
};

const sendEmail = async ({ email, subject, otp, resetLink, title, message, details }) => {
  const notifyEmail = (process.env.NOTIFY_EMAIL || "").trim();
  const recipient = (email || notifyEmail).trim();
  if (!recipient) throw new Error("Email recipient is required");

  const htmlContent = emailTemp({ otp, resetLink, title, message, details });

  let sent = false;
  let lastError = null;

  // 1. Try Gmail / SMTP first
  try {
    sent = await sendViaSmtp({ recipient, subject, htmlContent });
    if (sent) {
      console.log(`[Rent Nest Email] Delivered via SMTP to ${recipient}`);
      if (otp) console.log(`[Rent Nest Verification OTP] Code for ${recipient}: ${otp}`);
      return true;
    }
  } catch (smtpErr) {
    console.warn(`[Rent Nest Email] SMTP send failed: ${smtpErr.message}. Trying Brevo fallback...`);
    lastError = smtpErr;
  }

  // 2. Try Brevo as fallback
  try {
    sent = await sendViaBrevo({ recipient, subject, htmlContent });
    if (sent) {
      console.log(`[Rent Nest Email] Delivered via Brevo to ${recipient}`);
      if (otp) console.log(`[Rent Nest Verification OTP] Code for ${recipient}: ${otp}`);
      return true;
    }
  } catch (brevoErr) {
    console.error(`[Rent Nest Email] Brevo send failed: ${brevoErr.message}`);
    lastError = brevoErr;
  }

  if (otp) {
    console.log(`[Rent Nest Verification OTP fallback log] Code for ${recipient}: ${otp}`);
  }

  if (!sent) {
    throw new Error(
      lastError?.message || "Failed to deliver email: check SMTP and Brevo credentials"
    );
  }

  return true;
};

const mailSender = async ({ email, subject, otp, resetLink }) => {
  await sendEmail({ email, subject, otp, resetLink });
};

const sendNoticeEmail = async ({ email, subject, title, message, details }) => {
  const hasSmtp = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
  const hasBrevo = Boolean(process.env.BREVO_API_KEY);
  if (!hasSmtp && !hasBrevo) return false;

  try {
    await sendEmail({ email, subject, title, message, details });
    return true;
  } catch (err) {
    console.error("[Rent Nest Notice Email Error]:", err.message);
    return false;
  }
};

module.exports = {
  mailSender,
  sendNoticeEmail,
};
