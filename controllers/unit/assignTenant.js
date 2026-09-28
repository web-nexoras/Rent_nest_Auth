const { asyncHandler } = require("../../middlewares/asyncHandler");
const unitSchema = require("../../models/unitSchema");
const authSchema = require("../../models/authSchema");

const assignTenant = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { tenantId } = req.body;

  if (!tenantId) {
    return res.status(400).json({
      success: false,
      message: "Tenant ID is required",
    });
  }

  const unit = await unitSchema.findById(id);

  if (!unit) {
    return res.status(404).json({
      success: false,
      message: "Unit not found",
    });
  }

  if (unit.assignedTenant) {
    return res.status(400).json({
      success: false,
      message: "This unit is already occupied",
    });
  }

  const tenant = await authSchema.findById(tenantId);

  if (!tenant) {
    return res.status(404).json({
      success: false,
      message: "Tenant not found",
    });
  }

  if (tenant.role !== "tenant") {
    return res.status(400).json({
      success: false,
      message: "Selected user is not a tenant",
    });
  }

  if (!tenant.isVerified) {
    return res.status(400).json({
      success: false,
      message: "Tenant email is not verified",
    });
  }

  if (!tenant.isActive) {
    return res.status(400).json({
      success: false,
      message: "Tenant account is inactive",
    });
  }

  if (tenant.approvalStatus !== "approved") {
    return res.status(400).json({
      success: false,
      message: "Tenant is not approved",
    });
  }

  if (tenant.assignedUnit) {
    return res.status(400).json({
      success: false,
      message: "Tenant is already assigned to another unit",
    });
  }

  unit.assignedTenant = tenant._id;
  tenant.assignedUnit = unit._id;

  await unit.save();
  await tenant.save();

  return res.status(200).json({
    success: true,
    message: "Tenant assigned successfully",
    unit,
  });
});

module.exports = { assignTenant };
