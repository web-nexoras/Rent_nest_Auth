const nodemailer = require("nodemailer");
const {emailTemp}= require ('../../helpers/email/emailTemp.js')

// Create Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send Mail
const mailSender = async ({ email, subject, otp, resetLink }) => {
  await transporter.sendMail({
    from: `"Rent Nest" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html: emailTemp({
      otp,
      resetLink,
    }),
  });

  console.log(`Email sent successfully to ${email}`);
};

module.exports = {
  mailSender,
};
