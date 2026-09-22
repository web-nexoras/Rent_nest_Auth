const authSchema = require("../../models/authSchema");

const { asyncHandler } = require("../../middlewares/asyncHandler");

// -------- Get Profile Controller
const getProfile = asyncHandler(async (req, res) => {
  const user = await authSchema.findOne(
    { _id: req.user._id },
    {
      name: 1,
      email: 1,
      phone: 1,
      role: 1,
      profileImage: 1,
      presentAddress: 1,
      permanentAddress: 1,
      nidNumber: 1,
      occupation: 1,
      approvalStatus: 1,
      assignedUnit: 1,
      isVerified: 1,
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