const { asyncHandler } = require("../../middlewares/asyncHandler");

const { generateOTP, isValidEmail } = require("../../helpers/auth/authUtils");

const { mailSender } = require("../../helpers/email/mailService");
const authSchema = require("../../models/authSchema");

// -----------signup controller
const signup = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Name is required",
    });
  }

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

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: "Phone number is required",
    });
  }

  if (!password) {
    return res.status(400).json({
      success: false,
      message: "Password is required",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters",
    });
  }

  const existingUser = await authSchema.findOne({ email });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "User with this email already exists",
    });
  }

  const otp = generateOTP();

  const user = await authSchema.create({
    name,
    email,
    phone,
    password,
    otp,
    otpExpiry: new Date(Date.now() + 5 * 60 * 1000),
    role,
    approvalStatus: role === "admin",
  });

  await mailSender({
    email,
    subject: "Rent Nest - Email Verification OTP",
    otp,
  });

  return res.status(201).json({
    success: true,
    message: "Signup successful. OTP has been sent to your email.",
    userId: user._id,
  });
});

module.exports = {
  signup,
};
