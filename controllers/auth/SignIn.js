const authSchema = require("../../models/authSchema");

const { asyncHandler } = require("../../middlewares/asyncHandler");

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../helpers/auth/authUtils");

// Cookie Configuration
const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// ---- Signin Controller
const signin = asyncHandler(async (req, res) => {
  const {email, password} = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  const user = await authSchema.findOne({ email }).select("+password");

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  // Do not reveal account verification or approval state for a wrong password.
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

  // Check tenant approval
  if (user.role === "tenant" && user.approvalStatus !== "approved") {
    if (user.approvalStatus === "pending") {
      return res.status(403).json({
        success: false,
        message: "Your account is under review",
      });
    }

    if (user.approvalStatus === "rejected") {
      return res.status(403).json({
        success: false,
        message: "Your account has been rejected",
      });
    }
  }

  // Generate access token
  const accessToken = generateAccessToken(user);

  // Generate refresh token
  const refreshToken = generateRefreshToken(user);

  return res
    .status(200)
    .cookie("accTkn", accessToken, cookieConfig)
    .cookie("refTkn", refreshToken, cookieConfig)
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
      },
    });
});

module.exports = {
  signin,
};
