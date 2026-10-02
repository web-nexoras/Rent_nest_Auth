const { asyncHandler } = require("../../middlewares/asyncHandler");
const maintenanceSchema = require("../../models/maintenanceSchema");


const getAllMaintenance = asyncHandler(async (req, res) => {
  const { status, category } = req.query;

  const filter = {};

  if (status) {
    if (!["pending", "in-progress", "resolved"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid maintenance status",
      });
    }

    filter.status = status;
  }

  if (category) {
    if (!["plumbing", "electrical", "gas", "other"].includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid maintenance category",
      });
    }

    filter.category = category;
  }

  const maintenanceRequests = await maintenanceSchema
    .find(filter)
    .populate("tenant", "name email phone profileImage")
    .populate("unit", "unitNumber floor rentAmount")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    total: maintenanceRequests.length,
    maintenanceRequests,
  });
});

module.exports = {
  getAllMaintenance
};