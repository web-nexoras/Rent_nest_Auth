const { asyncHandler } = require("../../middlewares/asyncHandler");
const {
  generateOTP,
  isValidEmail,
  isValidPhone,
  normalizePhone,
  hashToken,
} = require("../../helpers/auth/authUtils");
const { mailSender } = require("../../helpers/email/mailService");
const authSchema = require("../../models/authSchema");

const signup = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || name.trim().length < 3 || name.trim().length > 25) {
    return res.status(400).json({
      success: false,
      message: "Name must be between 3 and 25 characters",
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
      message: "Please provide a valid email address",
    });
  }

  if (!phone || !isValidPhone(phone)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid Bangladesh mobile number (013-019XXXXXXXX or +8801XXXXXXXXX)",
    });
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters",
    });
  }

  const normalizedPhone = normalizePhone(phone);
  const localPhone = normalizedPhone.replace(/^\+88/, "");

  // Prevent duplicate registration by email or phone
  const existingUser = await authSchema.findOne({
    $or: [
      { email: email.trim().toLowerCase() },
      { phone: { $in: [phone.trim(), normalizedPhone, localPhone] } },
    ],
  });

  if (existingUser) {
    const isDuplicateEmail = existingUser.email === email.trim().toLowerCase();
    return res.status(409).json({
      success: false,
      message: isDuplicateEmail
        ? "User with this email already exists"
        : "User with this phone number already exists",
    });
  }

  // Store SHA-256 hashed OTP with 5-minute expiry
  const otp = generateOTP();

  const user = await authSchema.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: normalizedPhone,
    password,
    otp: hashToken(otp),
    otpExpiry: new Date(Date.now() + 5 * 60 * 1000),
  });

  void mailSender({
    email: user.email,
    subject: "Rent Nest - Email Verification OTP",
    otp,
  }).catch((mailError) => {
    console.error("Signup OTP email failed:", mailError);
  });

  return res.status(201).json({
    success: true,
    message: "Account created. Your verification code is on its way to your email.",
    userId: user._id,
  });
});

module.exports = {
  signup,
};
