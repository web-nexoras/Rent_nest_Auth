const authSchema = require("../../models/authSchema");
const crypto = require("crypto");
const {asyncHandler} = require("../../middlewares/asyncHandler");

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      message: "Password is required",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters long",
    });
  }

  // -------- Hash Reset Token

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");


  const user = await authSchema.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: {
      $gt: new Date(),
    },
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired reset link",
    });
  }

  // -------- Update Password
  user.password = password;

  // -------- Remove Reset Token
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
});

module.exports = {
  resetPassword,
};