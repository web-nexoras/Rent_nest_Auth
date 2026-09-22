const authSchema = require("../../models/authSchema");
const { asyncHandler } = require("../../middlewares/asyncHandler");

const {
  uploadCloudinary,
  destroyFromCloudinary,
} = require("../../helpers/cloudinary/cloudinaryUtils");

// -------- Update Profile Controller
const updateProfile = asyncHandler(async (req, res) => {
  const { name, presentAddress, permanentAddress, nidNumber, occupation } =
    req.body;

  const profileImage = req.file || req.files?.[0];

  const user = await authSchema.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  if (name?.trim()) {
    user.name = name;
  }

  if (presentAddress?.trim()) {
    user.presentAddress = presentAddress;
  }

  if (permanentAddress?.trim()) {
    user.permanentAddress = permanentAddress;
  }

  if (nidNumber?.trim()) {
    user.nidNumber = nidNumber;
  }

  if (occupation?.trim()) {
    user.occupation = occupation;
  }

  // ----------Update Profile Image
  if (profileImage) {
    const oldProfileImage = user.profileImage;

    const profileImageUrl = await uploadCloudinary({
      mimetype: profileImage.mimetype,
      imgBuffer: profileImage.buffer,
    });

    user.profileImage = profileImageUrl;

    //--------Delete old image from Cloudinary
    if (oldProfileImage) {
      try {
        await destroyFromCloudinary(oldProfileImage);
      } catch (error) {
        console.error("Old profile image delete error:", error);
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
