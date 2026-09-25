const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
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

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized or token expired",
    });
  }    
};

module.exports = {
  authMiddleware
};
