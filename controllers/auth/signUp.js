const { asyncHandler } = require("../../middlewares/asyncHandler");

const { generateOTP, isValidEmail } = require("../../helpers/auth/authUtils");

const { mailSender } = require("../../helpers/email/mailService");
const authSchema = require("../../models/authSchema");

// -----------signup controller
const signup = asyncHandler(async (req, res) => {
  const { fullname, email, password } = req.body;

  if (!fullname) {
    return res.status(400).json({
      success: false,
      message: "Fullname is required",
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

  // ---Generate OTP
  const otp = generateOTP();

  //-------Save  database
  const user = await authSchema.create({
    fullname,
    email,
    password,
    otp,
    otpExpires: new Date(Date.now() + 5 * 60 * 1000),
  });

  // ---Send OTP to email
  await mailSender({   
    email,
    subject: "OTP Verification",
    otp,
  });

  // ---Send response
  return res.status(201).json({
    success: true,
    message: "Signup successful. OTP has been sent to your email.",
    userId: user._id,
  });
});

module.exports = {
  signup,
};
