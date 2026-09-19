const authSchema = require("../../models/authSchema");
const {asyncHandler} = require("../../middlewares/asyncHandler");

const getProfile = asyncHandler(async (req, res) => {
  const user = await authSchema.findOne(
    { _id: req.user._id },
    {
      fullname: 1,
      email: 1,
      role: 1,
      avatar: 1,
      address: 1,
    }
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  return res.status(200).json({
    success: true,
    user,
  });
});

module.exports = {
  getProfile,
};