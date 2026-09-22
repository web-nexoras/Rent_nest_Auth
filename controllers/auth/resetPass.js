const authSchema = require("../../models/authSchema");

const { asyncHandler } = require("../../middlewares/asyncHandler");

// -------- Reset Password Controller
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Reset token is required",
    });
  }

  if (!password) {
    return res.status(400).json({
      success: false,
      message: "New password is required",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters",
    });
  }

  const user = await authSchema
    .findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: new Date() },
    })
    .select("+resetPasswordToken +resetPasswordExpiry");

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired reset token",
    });
  }

  // Update password
  user.password = password;

  // Clear reset token
  user.resetPasswordToken = null;
  user.resetPasswordExpiry = null;

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
});

module.exports = {
  resetPassword,
};