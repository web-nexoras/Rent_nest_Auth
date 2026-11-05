const maintenanceSchema = require("../../models/maintenanceSchema");
const mongoose = require("mongoose");

const { asyncHandler } = require("../../middlewares/asyncHandler");
const { destroyFromCloudinary } = require("../../helpers/cloudinary/cloudinaryUtils");

const deleteMaintenance = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: "Invalid request ID" });
  }

  const maintenanceRequest = await maintenanceSchema.findById(id);

  if (!maintenanceRequest) {
    return res.status(404).json({
      success: false,
      message: "Maintenance request not found",
    });
  }

  const isAdmin = req.user.role === "admin";

  if (!isAdmin && maintenanceRequest.tenant.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "You can only delete your own maintenance requests",
    });
  }

  if (!isAdmin && maintenanceRequest.status !== "pending") {
    return res.status(400).json({
      success: false,
      message: "Only pending requests can be deleted",
    });
  }

  if (maintenanceRequest.images?.length) {
    for (const image of maintenanceRequest.images) {
      try {
        await destroyFromCloudinary(image);
      } catch (error) {
        console.error("Maintenance image delete error:", error);
      }
    }
  }

  await maintenanceRequest.deleteOne();

  return res.status(200).json({
    success: true,
    message: "Maintenance request deleted successfully",
  });
});

module.exports = {
  deleteMaintenance
};
