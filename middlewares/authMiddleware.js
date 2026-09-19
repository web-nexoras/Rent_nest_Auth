const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const { accTkn } = req.cookies;

    if (!accTkn) {
      return res.status(401).json({
        success: false,
        message: "Access token is missing",
      });
    }

    const decoded = jwt.verify(accTkn, process.env.JWT_SEC);

    req.user = decoded;

    next();
  } catch (error) {
    console.log("AUTH ERROR:", error);

    return res.status(401).json({
      success: false,
      message: "Unauthorized or token expired",
    });
  }    
};

module.exports = {
  authMiddleware
};
