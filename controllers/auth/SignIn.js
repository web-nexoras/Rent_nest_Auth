const authSchema = require("../../models/authSchema");

const { asyncHandler } = require("../../middlewares/asyncHandler");

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../helpers/auth/authUtils");
const {
  accessCookieConfig,
  refreshCookieConfig,
} = require("../../helpers/auth/cookies");

// ---- Signin Controller
const signin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  const user = await authSchema
    .findOne({ email: email.toLowerCase() })
    .select("+password");

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  if (!user.isVerified) {
    return res.status(403).json({
      success: false,
      message: "Please verify your email first",
    });
  }

  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: "Your account is inactive",
    });
  }

  // Pending and rejected tenants can sign in to see their status.
  // Business routes stay blocked by requireApproved.

  // Generate access token
  const accessToken = generateAccessToken(user);

  // Generate refresh token
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