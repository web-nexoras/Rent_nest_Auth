const authSchema = require("../../models/authSchema");
const { asyncHandler } = require("../../middlewares/asyncHandler");

// ---------------- Verify OTP Controller
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;


  // -------- Validate input
  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "Email and OTP are required",
    });
  }

  // -------- Find user with valid OTP
  const user = await authSchema
    .findOne({
      email,
      otp,
      otpExpiry: { $gt: new Date() },
      isVerified: false,
    })
   

  // -------- Invalid or expired OTP
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired OTP",
    });
  }

  // -------- Verify user
  user.isVerified = true;
  user.otp = null;
  user.otpExpiry = null;

  await user.save();

  // -------- Response
  return res.status(200).json({
    success: true,
    message: "OTP verified successfully",
    user
  });
});

module.exports = {
  verifyOtp,
};
