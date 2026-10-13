const maintenanceSchema = require("../../models/maintenanceSchema");
const mongoose = require("mongoose");

const { asyncHandler } = require("../../middlewares/asyncHandler");

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

  if (
    req.user.role !== "admin" &&
    maintenanceRequest.tenant.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({
      success: false,
      message: "You can only delete your own maintenance requests",
    });
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
