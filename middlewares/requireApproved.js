const requireApproved = (req, res, next) => {
  if (req.user.role === "admin") {
    return next();
  }

  if (req.user.approvalStatus !== "approved") {
    return res.status(403).json({
      message: "Your account is not approved yet. Please wait for admin approval.",
    });
  }

  return next();
};

module.exports = {requireApproved}