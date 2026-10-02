const maintenanceSchema = require("../../models/maintenanceSchema");

const { asyncHandler } = require("../../middlewares/asyncHandler");

const deleteMaintenance = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const maintenanceRequest = await maintenanceSchema.findById(id);

  if (!maintenanceRequest) {
    return res.status(404).json({
      success: false,
      message: "Maintenance request not found",
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