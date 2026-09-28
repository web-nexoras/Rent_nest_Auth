const { asyncHandler } = require("../../middlewares/asyncHandler");
const unitSchema = require("../../models/unitSchema");
const authSchema = require("../../models/authSchema");

const unassignTenant = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const unit = await unitSchema.findById(id);

  if (!unit) {
    return res.status(404).json({
      success: false,
      message: "Unit not found",
    });
  }

  if (!unit.assignedTenant) {
    return res.status(400).json({
      success: false,
      message: "This unit has no assigned tenant",
    });
  }

  const tenantId = unit.assignedTenant;

  const tenant = await authSchema.findById(tenantId);

  unit.assignedTenant = null;

  if (tenant) {
    tenant.assignedUnit = null;
    await tenant.save();
  }

  await unit.save();

  return res.status(200).json({
    success: true,
    message: "Tenant unassigned successfully",
    unit,
  });
});

module.exports = { unassignTenant };
