const jwt = require("jsonwebtoken");
const authSchema = require("../../models/authSchema");
const { asyncHandler } = require("../../middlewares/asyncHandler");
const { generateAccessToken } = require("../../helpers/auth/authUtils");
const { accessCookieConfig } = require("../../helpers/auth/cookies");

const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refTkn;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Refresh token is missing",
    });
  }

  if (!process.env.JWT_SEC) {
    return res.status(500).json({
      success: false,
      message: "JWT_SEC is not configured",
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SEC);
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Refresh token is invalid or expired",
    });
  }

  const user = await authSchema.findById(decoded._id);

  if (!user || !user.isVerified || !user.isActive) {
    return res.status(401).json({
      success: false,
      message: "Unable to refresh this session",
    });
  }

  const accessToken = generateAccessToken(user);

  return res.status(200).cookie("accTkn", accessToken, accessCookieConfig).json({
    success: true,
    message: "Access token refreshed",
  });
});

module.exports = { refreshToken };
