const { baseCookieConfig } = require("../../helpers/auth/cookies");

const logOut = (req, res) => {
  res
    .clearCookie("accTkn", baseCookieConfig)
    .clearCookie("refTkn", baseCookieConfig)
    .status(200)
    .json({
      success: true,
      message: "Logout successful",
    });
};

module.exports = {
  logOut,
};