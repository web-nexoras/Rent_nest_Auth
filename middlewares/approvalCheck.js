const authSchema = require("../models/authSchema");

// ---------------- Tenant Approval ----------------
const approvalCheck = async (req, res, next) => {
  try {
    // Admin doesn't need approval
    if (req.user.role === "admin") {
      return next();
    }

    const user = await authSchema
      .findById(req.user._id)
      .select("approvalStatus");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

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

    next();
  } catch (error) {
    next(error);
  }
};


module.exports = {approvalCheck  }