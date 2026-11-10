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
      message: "Please provide a valid phone number (e.g. 017XXXXXXXX)",
    });
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters",
    });
  }

  const normalizedPhone = normalizePhone(phone);

  // Prevent duplicate registration by email or phone
  const existingUser = await authSchema.findOne({
    $or: [
      { email: email.trim().toLowerCase() },
      { phone: { $in: [phone.trim(), normalizedPhone] } },
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

  try {
    await mailSender({
      email: user.email,
      subject: "Rent Nest - Email Verification OTP",
      otp,
    });
  } catch (mailError) {
    console.error("Signup OTP email failed:", mailError);
    return res.status(502).json({
      success: false,
      message: "Account created, but the verification email could not be sent. Please request a new OTP.",
      userId: user._id,
    });
  }

  return res.status(201).json({
    success: true,
    message: "Signup successful. OTP has been sent to your email.",
    userId: user._id,
  });
});

module.exports = {
  signup,
};
