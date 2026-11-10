const mongoose = require("mongoose");
const { asyncHandler } = require("../../../../middlewares/asyncHandler");
const authSchema = require("../../../../models/authSchema");
const unitSchema = require("../../../../models/unitSchema");
const {
  isValidEmail,
  isValidPhone,
  normalizePhone,
} = require("../../../../helpers/auth/authUtils");
const { sendNoticeEmail } = require("../../../../helpers/email/mailService");
const { invalidateCache } = require("../../../../middlewares/redisCache");

/**
 * Admin Direct Onboarding:
 * Creates a tenant account directly (already verified & approved),
 * optionally assigns a vacant flat, and emails login credentials.
 */
const createTenantByAdmin = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    password,
    unitId,
    nidNumber,
    occupation,
    presentAddress,
    permanentAddress,
  } = req.body;

  if (!name || name.trim().length < 3 || name.trim().length > 25) {
    return res.status(400).json({
      success: false,
      message: "Name must be between 3 and 25 characters",
    });
  }

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address",
    });
  }

  if (!phone || !isValidPhone(phone)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid phone number",
    });
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters",
    });
  }

  const cleanEmail = email.trim().toLowerCase();
  const normalizedPhone = normalizePhone(phone);

  const existing = await authSchema.findOne({
    $or: [
      { email: cleanEmail },
      { phone: { $in: [phone.trim(), normalizedPhone] } },
    ],
  });

  if (existing) {
    return res.status(409).json({
      success: false,
      message:
        existing.email === cleanEmail
          ? "A user with this email already exists"
          : "A user with this phone number already exists",
    });
  }

  let unit = null;
  if (unitId) {
    if (!mongoose.isValidObjectId(unitId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid unit ID",
      });
    }
    unit = await unitSchema.findById(unitId);
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Selected unit not found",
      });
    }
    if (unit.assignedTenant || unit.status === "occupied") {
      return res.status(409).json({
        success: false,
        message: `Unit ${unit.unitNumber} is already occupied`,
      });
    }
  }

  const tenant = await authSchema.create({
    name: name.trim(),
    email: cleanEmail,
    phone: normalizedPhone,
    password,
    role: "tenant",
    isVerified: true,
    approvalStatus: "approved",
    isActive: true,
    assignedUnit: unit ? unit._id : null,
    nidNumber: nidNumber?.trim() || "",
    occupation: occupation?.trim() || "",
    presentAddress: presentAddress?.trim() || "",
    permanentAddress: permanentAddress?.trim() || "",
  });

  if (unit) {
    unit.assignedTenant = tenant._id;
    await unit.save();
  }

  await invalidateCache("admin", "units", "tenants", "payments");

  try {
    await sendNoticeEmail({
      email: tenant.email,
      subject: "Welcome to Rent Nest — Your Tenant Account Credentials",
      title: "Your Rent Nest Account is Ready",
      message: `Hello ${tenant.name}, the property administrator has created your tenant account${unit ? ` and assigned you to Unit ${unit.unitNumber}` : ""}. You can sign in using your email or phone number.`,
      details: {
        "Login Email": tenant.email,
        "Login Phone": tenant.phone,
        "Temporary Password": password,
        ...(unit
          ? {
              "Assigned Unit": unit.unitNumber,
              "Fixed Monthly Rent": `${unit.rentAmount} BDT`,
              "Rent Due Day": `Day ${unit.rentDueDay} (Overdue after 10th)`,
            }
          : {}),
      },
    });
  } catch (err) {
    console.error("Welcome email failed:", err.message);
  }

  const populated = await authSchema
    .findById(tenant._id)
    .populate("assignedUnit", "unitNumber floor rentAmount");

  return res.status(201).json({
    success: true,
    message: unit
      ? `Tenant created and assigned to Unit ${unit.unitNumber}`
      : "Tenant created and approved successfully",
    tenant: populated,
  });
});

module.exports = { createTenantByAdmin };
