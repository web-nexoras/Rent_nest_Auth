const { asyncHandler } = require("../../middlewares/asyncHandler");
const maintenanceSchema = require("../../models/maintenanceSchema");
const mongoose = require("mongoose");

const getSingleMaintenance = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: "Invalid request ID" });
  }

  const maintenanceRequest = await maintenanceSchema
    .findById(id)
    .populate("tenant", "name email phone profileImage")
    .populate("unit", "unitNumber floor rentAmount");

  if (!maintenanceRequest) {
    return res.status(404).json({
      success: false,
      message: "Maintenance request not found",
    });
  }

  if (
    req.user.role !== "admin" &&
    maintenanceRequest.tenant._id.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({
      success: false,
      message: "You can only view your own maintenance requests",
    });
  }

  return res.status(200).json({
    success: true,
    maintenanceRequest,
  });
});

module.exports = {
  getSingleMaintenance
};
