const mongoose = require("mongoose");
const { asyncHandler } = require("../../../../middlewares/asyncHandler");
const authSchema = require("../../../../models/authSchema");
const unitSchema = require("../../../../models/unitSchema");
const {
  isValidEmail,
  isValidPhone,
  normalizePhone,
} = require("../../../../helpers/auth/authUtils");
const { invalidateCache } = require("../../../../middlewares/redisCache");

/**
 * Admin Full Tenant Update:
 * Allows admin to modify any field of a tenant:
 * name, email, phone, password, nidNumber, occupation, presentAddress,
 * permanentAddress, approvalStatus, isActive, and assignedUnit (move/assign/unassign).
 */
const updateTenantByAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid tenant ID",
    });
  }

  const tenant = await authSchema.findById(id).select("+password");

  if (!tenant || tenant.role !== "tenant") {
    return res.status(404).json({
      success: false,
      message: "Tenant not found",
    });
  }

  const {
    name,
    email,
    phone,
    password,
    nidNumber,
    occupation,
    presentAddress,
    permanentAddress,
    approvalStatus,
    isActive,
    unitId,
  } = req.body;

  if (name !== undefined) {
    const trimmed = String(name).trim();
    if (trimmed.length < 3 || trimmed.length > 25) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 3 and 25 characters",
      });
    }
    tenant.name = trimmed;
  }

  if (email !== undefined) {
    const cleanEmail = String(email).trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }
    const duplicate = await authSchema.findOne({
      email: cleanEmail,
      _id: { $ne: tenant._id },
    });
    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Another account is already using this email",
      });
    }
    tenant.email = cleanEmail;
  }

  if (phone !== undefined) {
    if (!isValidPhone(String(phone))) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid phone number",
      });
    }
    const normalizedPhone = normalizePhone(phone);
    const duplicate = await authSchema.findOne({
      phone: normalizedPhone,
      _id: { $ne: tenant._id },
    });
    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Another account is already using this phone number",
      });
    }
    tenant.phone = normalizedPhone;
  }

  if (password !== undefined && String(password).trim() !== "") {
    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }
    tenant.password = String(password);
    tenant.isVerified = true;
  }

  if (nidNumber !== undefined) tenant.nidNumber = String(nidNumber).trim();
  if (occupation !== undefined) tenant.occupation = String(occupation).trim();
  if (presentAddress !== undefined) tenant.presentAddress = String(presentAddress).trim();
  if (permanentAddress !== undefined) tenant.permanentAddress = String(permanentAddress).trim();

  if (approvalStatus !== undefined) {
    if (!["pending", "approved", "rejected"].includes(approvalStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid approval status",
      });
    }
    tenant.approvalStatus = approvalStatus;
    if (approvalStatus === "approved") {
      tenant.isVerified = true;
    }
  }

  if (isActive !== undefined) {
    tenant.isActive = Boolean(isActive);
  }

  // Handle unit assignment / reassignment / unassignment if unitId is explicitly passed
  if (unitId !== undefined) {
    const currentUnitId = tenant.assignedUnit ? String(tenant.assignedUnit) : "";
    const targetUnitId = unitId ? String(unitId) : "";

    if (currentUnitId !== targetUnitId) {
      // Unassign previous unit if any
      if (currentUnitId) {
        const oldUnit = await unitSchema.findById(currentUnitId);
        if (oldUnit) {
          oldUnit.assignedTenant = null;
          await oldUnit.save();
        }
      }

      if (!targetUnitId) {
        tenant.assignedUnit = null;
      } else {
        if (!mongoose.isValidObjectId(targetUnitId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid target unit ID",
          });
        }
        const nextUnit = await unitSchema.findById(targetUnitId);
        if (!nextUnit) {
          return res.status(404).json({
            success: false,
            message: "Target unit not found",
          });
        }
        if (nextUnit.assignedTenant && String(nextUnit.assignedTenant) !== String(tenant._id)) {
          return res.status(409).json({
            success: false,
            message: `Unit ${nextUnit.unitNumber} is already occupied`,
          });
        }
        nextUnit.assignedTenant = tenant._id;
        await nextUnit.save();
        tenant.assignedUnit = nextUnit._id;
        tenant.approvalStatus = "approved";
        tenant.isVerified = true;
      }
    }
  }

  await tenant.save();
  await invalidateCache("admin", "units", "tenants", "payments");

  const updated = await authSchema
    .findById(tenant._id)
    .populate("assignedUnit", "unitNumber floor rentAmount");

  return res.status(200).json({
    success: true,
    message: "Tenant details updated successfully",
    tenant: updated,
  });
});

module.exports = { updateTenantByAdmin };
