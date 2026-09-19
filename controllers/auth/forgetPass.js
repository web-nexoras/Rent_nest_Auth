const authSchema = require("../../models/authSchema");

const { isValidEmail } = require("../../helpers/auth/authUtils");
const { mailSender } = require("../../helpers/email/mailService");

const { asyncHandler } = require("../../middlewares/asyncHandler");

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email",
    });
  }

  const user = await authSchema.findOne({ email });

  if (!user) {
    return res.status(200).json({
      success: true,
      message:
        "If an account with this email exists, a reset link has been sent",
    });
  }

  const resetToken = user.createPasswordResetToken();

  await user.save({
    validateBeforeSave: false,
  });

  const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    await mailSender({
      email: user.email,
      subject: "Password Reset Request",
      resetLink,
    });
  } catch (mailError) {
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save({
      validateBeforeSave: false,
    });

    console.error("Password reset email failed:", mailError);

    return res.status(500).json({
      success: false,
      message: "Failed to send reset email",
    });
  }

  return res.status(200).json({
    success: true,
    message: "If an account with this email exists, a reset link has been sent",
  });
});

module.exports = {
  forgotPassword,
};
