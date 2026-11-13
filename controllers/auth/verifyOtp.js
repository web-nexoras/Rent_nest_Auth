const authSchema = require("../../models/authSchema");
const { asyncHandler } = require("../../middlewares/asyncHandler");
const { hashToken } = require("../../helpers/auth/authUtils");

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "Email and OTP are required",
    });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const cleanOtp = String(otp).trim();

  // Verify hashed OTP and check expiry
  const user = await authSchema.findOne({
    email: cleanEmail,
    otp: hashToken(cleanOtp),
    otpExpiry: { $gt: new Date() },
    isVerified: false,
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired OTP",
    });
  }

  user.isVerified = true;
  user.otp = null;
  user.otpExpiry = null;

  await user.save();

  return res.status(200).json({
    success: true,
    message: "OTP verified successfully. Wait for admin approval before using tenant features.",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      approvalStatus: user.approvalStatus,
      isVerified: user.isVerified,
    },
  });
});

module.exports = {
  verifyOtp,
};
