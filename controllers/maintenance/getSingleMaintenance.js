const { asyncHandler } = require("../../middlewares/asyncHandler");
const maintenanceSchema = require("../../models/maintenanceSchema");

const getSingleMaintenance = asyncHandler(async (req, res) => {
  const { id } = req.params;

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

  return res.status(200).json({
    success: true,
    maintenanceRequest,
  });
});

module.exports = {
  getSingleMaintenance
};