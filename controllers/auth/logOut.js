const logOut = (req, res) => {
  res
    .clearCookie("accTkn", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .clearCookie("refTkn", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .status(200)
    .json({
      success: true,
      message: "Logout successful",
    });
};

module.exports = {
  logOut,
};