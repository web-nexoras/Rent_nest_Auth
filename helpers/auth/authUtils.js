const crypto = require("crypto");
const jwt = require("jsonwebtoken");
// --------email regex
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// --------- Generate a random 4-digit OTP
const generateOTP = () => {
  return crypto.randomInt(1000, 10000).toString();
};

//-------Access Token Generate
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SEC,
    { expiresIn: "15m" },
  );
};

// ---------refresh token generate
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SEC,
    { expiresIn: "7d" },
  );
};

// -----------generateResetToken
const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

const hashToken = (value) => {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
};

module.exports = {
  isValidEmail,
  generateOTP,
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  hashToken,
};
