const { asyncHandler } = require("../../middlewares/asyncHandler");
const { generateOTP, hashToken } = require("../../helpers/auth/authUtils");
const { mailSender } = require("../../helpers/email/mailService");
const authSchema = require("../../models/authSchema");

const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = await authSchema.findOne({
    email: cleanEmail,
    isVerified: false,
  });

  if (!user) {
    // Check if user is already verified
    const alreadyVerified = await authSchema.findOne({ email: cleanEmail, isVerified: true });
    if (alreadyVerified) {
      return res.status(400).json({
        success: false,
        message: "This account is already verified. Please sign in.",
      });
    }

    return res.status(404).json({
      success: false,
      message: "No unverified account found for this email. Please sign up first.",
    });
  }

  const otp = generateOTP();

  user.otp = hashToken(otp);
  user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
  await user.save();

  try {
    await mailSender({
      email: cleanEmail,
      subject: "Rent Nest - OTP Verification",
      otp,
    });
  } catch (mailErr) {
    console.error("Resend OTP email failed:", mailErr.message);
    return res.status(502).json({
      success: false,
      message: "Could not send verification email. Please try again in a few moments.",
      devOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
    });
  }

  return res.status(200).json({
    success: true,
    message: "OTP resent successfully. Please check your email.",
    devOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
  });
});

module.exports = {
  resendOtp,
};
