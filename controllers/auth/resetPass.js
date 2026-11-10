const authSchema = require("../../models/authSchema");
const { asyncHandler } = require("../../middlewares/asyncHandler");
const { hashToken } = require("../../helpers/auth/authUtils");

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
      resetPasswordToken: hashToken(token),
      resetPasswordExpiry: { $gt: new Date() },
    })
    .select("+resetPasswordToken +resetPasswordExpiry");

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired reset token",
    });
  }

  user.password = password;
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
