const unitSchema = require("../../models/unitSchema");
const mongoose = require("mongoose");
const { asyncHandler } = require("../../middlewares/asyncHandler");

const getSingleUnit = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: "Invalid unit ID" });
  }

  const unit = await unitSchema
    .findById(id)
    .populate("assignedTenant", "name email phone profileImage");

  if (!unit) {
    return res.status(404).json({
      success: false,
      message: "Unit not found",
    });
  }

  const assignedTenantId = unit.assignedTenant?._id || unit.assignedTenant;
  if (
    req.user.role !== "admin" &&
    (!assignedTenantId || assignedTenantId.toString() !== req.user._id.toString())
  ) {
    return res.status(403).json({
      success: false,
      message: "You can only view your assigned unit",
    });
  }

  return res.status(200).json({
    success: true,
    unit,
  });
});

module.exports = { getSingleUnit };
