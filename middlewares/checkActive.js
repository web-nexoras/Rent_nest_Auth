const checkActive = (req, res, next) => {
  if (!req.user.isActive) {
    return res.status(403).json({ message: "Your account has been deactivated." });
  }
  return next();
};


module.exports = {checkActive }