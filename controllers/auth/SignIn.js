const authSchema = require("../../models/authSchema");
const { asyncHandler } = require("../../middlewares/asyncHandler");
const {
  isValidEmail,
  isValidPhone,
  normalizePhone,
  generateAccessToken,
  generateRefreshToken,
} = require("../../helpers/auth/authUtils");
const {
  accessCookieConfig,
  refreshCookieConfig,
} = require("../../helpers/auth/cookies");

// Sign in using either email or phone number
const signin = asyncHandler(async (req, res) => {
  const { identifier, email, phone, password } = req.body;
  const rawLogin = String(identifier || email || phone || "").trim();

  if (!rawLogin || !password) {
    return res.status(400).json({
      success: false,
      message: "Email/Phone and password are required",
    });
  }

  if (typeof password !== "string" || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters",
    });
  }

  // Detect email vs phone login and build lookup query
  const looksLikeEmail = rawLogin.includes("@");
  let query;

  if (looksLikeEmail) {
    if (!isValidEmail(rawLogin)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }
    query = { email: rawLogin.toLowerCase() };
  } else {
    if (!isValidPhone(rawLogin)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid phone number or email address",
      });
    }
    const normalized = normalizePhone(rawLogin);
    const variants = Array.from(
      new Set([rawLogin, normalized, `+88${normalized}`, `88${normalized}`]),
    );
    query = { phone: { $in: variants } };
  }

  const user = await authSchema.findOne(query).select("+password");

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  if (!user.isVerified) {
    return res.status(403).json({
      success: false,
      message: "Please verify your email first",
      email: user.email,
    });
  }

  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: "Your account is inactive",
    });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return res
    .status(200)
    .cookie("accTkn", accessToken, accessCookieConfig)
    .cookie("refTkn", refreshToken, refreshCookieConfig)
    .json({
      success: true,
      message: "Signin successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        approvalStatus: user.approvalStatus,
        isActive: user.isActive,
        assignedUnit: user.assignedUnit,
      },
    });
});

module.exports = {
  signin,
};
