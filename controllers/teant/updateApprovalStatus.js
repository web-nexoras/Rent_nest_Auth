const mongoose = require("mongoose");
const authSchema = require("../../models/authSchema");
const unitSchema = require("../../models/unitSchema");
const { asyncHandler } = require("../../middlewares/asyncHandler");

const updateApprovalStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { approvalStatus, unitId } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
  }

  if (!["approved", "rejected"].includes(approvalStatus)) {
    return res.status(400).json({
      success: false,
      message: "approvalStatus must be 'approved' or 'rejected'",
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
      message: "Only tenant accounts can be approved or rejected",
    });
  }

  if (tenant.approvalStatus !== "pending") {
    return res.status(400).json({
      success: false,
      message: `This user is already ${tenant.approvalStatus}`,
    });
  }

  if (approvalStatus === "rejected") {
    tenant.approvalStatus = "rejected";
    await tenant.save();

    return res.status(200).json({
      success: true,
      message: "Tenant rejected",
      tenant,
    });
  }

  if (!unitId || !mongoose.isValidObjectId(unitId)) {
    return res.status(400).json({
      success: false,
      message: "A valid unitId is required to approve a tenant",
    });
  }

  const unit = await unitSchema.findById(unitId);

  if (!unit) {
    return res.status(404).json({
      success: false,
      message: "Unit not found",
    });
  }

  if (unit.assignedTenant) {
    return res.status(409).json({
      success: false,
      message: "This unit already has a tenant assigned",
    });
  }

  tenant.approvalStatus = "approved";
  tenant.assignedUnit = unit._id;
  unit.assignedTenant = tenant._id;

  await unit.save();
  await tenant.save();

  return res.status(200).json({
    success: true,
    message: "Tenant approved and unit assigned successfully",
    tenant,
    unit,
  });
});

module.exports = { updateApprovalStatus };