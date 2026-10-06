const mongoose = require("mongoose");
const authSchema = require("../../models/authSchema");
const unitSchema = require("../../models/unitSchema");
const { asyncHandler } = require("../../middlewares/asyncHandler");

const removeTenant = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
  }

  const tenant = await authSchema.findById(id);

  if (!tenant) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  if (tenant.role !== "tenant") {
    return res.status(400).json({
      success: false,
      message: "Only tenant accounts can be removed this way",
    });
  }

  if (tenant.assignedUnit) {
    const unit = await unitSchema.findById(tenant.assignedUnit);
    if (unit) {
      unit.assignedTenant = null;
      await unit.save();
    }
  }

  await tenant.deleteOne();

  return res.status(200).json({
    success: true,
    message: "Tenant removed successfully",
  });
});

module.exports = { removeTenant };