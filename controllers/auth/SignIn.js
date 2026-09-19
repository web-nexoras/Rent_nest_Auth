const authSchema = require("../../models/authSchema");
const {asyncHandler} = require("../../middlewares/asyncHandler");
const { generateAccessToken, generateRefreshToken } = require("../../helpers/auth/authUtils");




// Cookie Configuration
const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
};

// ----Signin Controller 

const signin = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and Password are required",
    });
  }

  // 3. Find user
  const user = await authSchema.findOne({ email }).select("+password");

  if (!user) {
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

  //------Compare password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  //---Generate access token
  const accessToken = generateAccessToken(user);

  //----=Generate refresh token
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
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
});

module.exports = {
  signin,
};