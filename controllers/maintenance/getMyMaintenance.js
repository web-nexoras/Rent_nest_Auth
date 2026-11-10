const { asyncHandler } = require("../../middlewares/asyncHandler");
const maintenanceSchema = require("../../models/maintenanceSchema");

const getMyMaintenance = asyncHandler(async (req, res) => {
  const maintenanceRequests = await maintenanceSchema
    .find({ tenant: req.user._id })
    .populate("unit", "unitNumber floor rentAmount")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    total: maintenanceRequests.length,
    maintenanceRequests,
  });
});

module.exports = {
  getMyMaintenance
};
