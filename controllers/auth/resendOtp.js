const { asyncHandler } = require("../../middlewares/asyncHandler");

const { generateOTP } = require("../../helpers/auth/authUtils");

const { mailSender } = require("../../helpers/email/mailService");
const authSchema = require("../../models/authSchema");


// -------- Resend OTP Controller 
const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  const user = await authSchema.findOne({
    email,
    isVerified: false,
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid request",
    });
  }

  //----Generate new OTP
  const otp = generateOTP();

  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);

  await user.save();

  //----Send OTP to  email
  await mailSender({
    email,
    subject: "OTP Verification",
    otp,
  });

  return res.status(200).json({
    success: true,
    message: "OTP resent successfully",
  });
});

module.exports = {
  resendOtp
};