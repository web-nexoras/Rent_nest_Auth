const jwt = require("jsonwebtoken");
const authSchema = require("../models/authSchema");

const authMiddleware = async (req, res, next) => {
  try {
    const accTkn = req.cookies?.accTkn;

    if (!accTkn) {
      return res.status(401).json({
        success: false,
        message: "Access token is missing",
      });
    }

    if (!process.env.JWT_SEC) {
      return next(new Error("JWT_SEC is not configured"));
    }

    const decoded = jwt.verify(accTkn, process.env.JWT_SEC);

    const user = await authSchema.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found, token invalid",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized or token expired",
    });
  }
};

module.exports = {
  authMiddleware,
};