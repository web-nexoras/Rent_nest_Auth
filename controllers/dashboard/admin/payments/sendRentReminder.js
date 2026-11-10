const mongoose = require("mongoose");
const { asyncHandler } = require("../../../../middlewares/asyncHandler");
const authSchema = require("../../../../models/authSchema");
const unitSchema = require("../../../../models/unitSchema");
const paymentSchema = require("../../../../models/paymentSchema");
const { getCurrentMonth, isValidMonth } = require("../../../../helpers/month");
const {
  sendSingleTenantReminder,
  sendMonthlyRentReminders,
} = require("../../../../helpers/reminders/rentReminderService");
const { invalidateCache } = require("../../../../middlewares/redisCache");

/**
 * POST /api/v1/payments/remind/:tenantId
 * Sends an immediate rent/overdue reminder to a specific tenant.
 */
const sendTenantReminderController = asyncHandler(async (req, res) => {
  const { tenantId } = req.params;
  const month = req.body?.month || req.query?.month || getCurrentMonth();
  const customNote = req.body?.note || "";

  if (!mongoose.isValidObjectId(tenantId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid tenant ID",
    });
  }

  if (!isValidMonth(month)) {
    return res.status(400).json({
      success: false,
      message: "Month must be in YYYY-MM format",
    });
  }

  const tenant = await authSchema.findById(tenantId).select("name email phone assignedUnit role");
  if (!tenant || tenant.role !== "tenant") {
    return res.status(404).json({
      success: false,
      message: "Tenant not found",
    });
  }

  if (!tenant.assignedUnit) {
    return res.status(400).json({
      success: false,
      message: "This tenant does not have an assigned unit",
    });
  }

  const existingPayment = await paymentSchema.findOne({
    tenant: tenant._id,
    month,
    status: { $in: ["pending", "verified"] },
  });

  if (existingPayment) {
    return res.status(400).json({
      success: false,
      message: `Tenant has already submitted payment for ${month}`,
    });
  }

  const unit = await unitSchema.findById(tenant.assignedUnit);
  if (!unit) {
    return res.status(404).json({
      success: false,
      message: "Assigned unit not found",
    });
  }

  const outcome = await sendSingleTenantReminder({
    tenant,
    unit,
    month,
    forceManual: true,
    customNote,
  });

  await invalidateCache("admin", "units", "payments", "tenant");

  return res.status(200).json({
    success: true,
    message: `Rent reminder (#${outcome.reminder.reminderCount}) sent to ${tenant.name} (${unit.unitNumber})`,
    reminder: outcome.reminder,
  });
});

/**
 * POST /api/v1/payments/remind-all
 * Sends immediate rent/overdue reminders to all unpaid occupied units for the month.
 */
const sendBulkRemindersController = asyncHandler(async (req, res) => {
  const month = req.body?.month || req.query?.month || getCurrentMonth();
  const customNote = req.body?.note || "";

  if (!isValidMonth(month)) {
    return res.status(400).json({
      success: false,
      message: "Month must be in YYYY-MM format",
    });
  }

  const { sentCount, results } = await sendMonthlyRentReminders({
    forceManual: true,
    month,
    customNote,
  });

  return res.status(200).json({
    success: true,
    message:
      sentCount > 0
        ? `Sent rent reminders to ${sentCount} unpaid tenant${sentCount === 1 ? "" : "s"}`
        : "All active tenants have already paid or submitted rent for this month",
    sentCount,
    results,
  });
});

module.exports = {
  sendTenantReminderController,
  sendBulkRemindersController,
};
