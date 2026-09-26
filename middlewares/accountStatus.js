const authSchema = require("../models/authSchema");

// ---------------- Account Status ----------------
const accountStatus = async (req, res, next) => {
  try {
    const user = await authSchema
      .findById(req.user._id)
      .select("isActive isVerified role approvalStatus");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first",
      });
    }

    req.userData = user;

    next();
  } catch (error) {
    next(error);
  }
};


module.exports = {accountStatus}