const { asyncHandler } = require("../../middlewares/asyncHandler");
const mongoose = require("mongoose");
const authSchema = require("../../models/authSchema");

const toggleTenantActive = asyncHandler(async (req, res) => {
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
      message: "Only tenant accounts can be activated/deactivated this way",
    });
  }

  tenant.isActive = !tenant.isActive;
  await tenant.save();

  return res.status(200).json({
    success: true,
    message: `Tenant ${tenant.isActive ? "activated" : "deactivated"} successfully`,
    tenant: {
      _id: tenant._id,
      name: tenant.name,
      isActive: tenant.isActive,
    },
  });
});

module.exports = { toggleTenantActive };