const authSchema = require("../../models/authSchema");
const {asyncHandler} = require("../../middlewares/asyncHandler");

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "Email and OTP are required",
    });
  }

  const user = await authSchema.findOne({
    email,
    otp,
    otpExpires: { $gt: new Date() },
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
  user.otpExpires = null;

  await user.save();

  return res.status(200).json({
    success: true,
    message: "OTP verified successfully",
  });
});

module.exports = {
  verifyOtp,
};
