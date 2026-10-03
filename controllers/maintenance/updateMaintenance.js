const { asyncHandler } = require("../../middlewares/asyncHandler");
const maintenanceSchema = require("../../models/maintenanceSchema");

const updateMaintenanceStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: "Status is required",
    });
  }

  if (!["pending", "in-progress", "resolved"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid maintenance status",
    });
  }

  const maintenanceRequest = await maintenanceSchema.findById(id);

  if (!maintenanceRequest) {
    return res.status(404).json({
      success: false,
      message: "Maintenance request not found",
    });
  }

  maintenanceRequest.status = status;

  if (status === "resolved") {
    maintenanceRequest.resolvedAt = new Date();
  } else {
    maintenanceRequest.resolvedAt = null;
  }

  await maintenanceRequest.save();

  return res.status(200).json({
    success: true,
    message: "Maintenance status updated successfully",
    maintenanceRequest,
  });
});

module.exports = {
  updateMaintenanceStatus
};