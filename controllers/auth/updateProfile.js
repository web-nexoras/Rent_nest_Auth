const authSchema = require("../../models/authSchema");
const { asyncHandler } = require("../../middlewares/asyncHandler");

const {
  uploadCloudinary,
  destroyFromCloudinary,
} = require("../../helpers/cloudinary/cloudinaryUtils");

// -------- Update Profile Controller
const updateProfile = asyncHandler(async (req, res) => {
  const { fullname, address } = req.body;

  const avatar = req.file || req.files?.[0];

  const user = await authSchema.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  if (fullname?.trim()) {
    user.fullname = fullname;
  }

  if (address?.trim()) {
    user.address = address;
  }

  if (avatar) {
    const oldAvatar = user.avatar;

    const avatarUrl = await uploadCloudinary({
      mimetype: avatar.mimetype,
      imgBuffer: avatar.buffer,
    });

    user.avatar = avatarUrl;

    if (oldAvatar) {
      try {
        await destroyFromCloudinary(oldAvatar);
      } catch (error) {
        console.error("Old avatar delete error:", error);
      }
    }
  }

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user,
  });
});

module.exports = {
  updateProfile,
};
