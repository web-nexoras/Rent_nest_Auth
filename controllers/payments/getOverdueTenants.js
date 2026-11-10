const { asyncHandler } = require("../../middlewares/asyncHandler");
const authSchema = require("../../models/authSchema");
const paymentSchema = require("../../models/paymentSchema");
const rentReminderSchema = require("../../models/rentReminderSchema");
const { getCurrentMonth, isValidMonth } = require("../../helpers/month");

// List unpaid tenants for the month with due-day and 10th-of-month overdue status
const getOverdueTenants = asyncHandler(async (req, res) => {
  const currentMonth = req.query.month || getCurrentMonth();

  if (!isValidMonth(currentMonth)) {
    return res.status(400).json({
      success: false,
      message: "Month must be in YYYY-MM format",
    });
  }

  const paidTenantIds = await paymentSchema.distinct("tenant", {
    month: currentMonth,
    status: { $in: ["pending", "verified"] },
  });

  const [overdueTenants, reminders] = await Promise.all([
    authSchema
      .find({
        role: "tenant",
        approvalStatus: "approved",
        isActive: true,
        assignedUnit: { $ne: null },
        _id: { $nin: paidTenantIds },
      })
      .select("name email phone assignedUnit")
      .populate("assignedUnit", "unitNumber floor rentAmount rentDueDay")
      .lean(),
    rentReminderSchema
      .find({ month: currentMonth })
      .select("tenant sentAt reminderCount lastStage")
      .lean(),
  ]);

  const reminderMap = new Map(reminders.map((r) => [String(r.tenant), r]));
  const now = new Date();
  const isPast10th =
    currentMonth < getCurrentMonth() ||
    (currentMonth === getCurrentMonth() && now.getDate() > 10);

  const enriched = overdueTenants.map((tenant) => {
    const reminder = reminderMap.get(String(tenant._id)) || null;
    const dueDay = tenant.assignedUnit?.rentDueDay || 5;
    const isPastDueDay =
      currentMonth < getCurrentMonth() ||
      (currentMonth === getCurrentMonth() && now.getDate() > dueDay);

    return {
      ...tenant,
      isOverdue: isPast10th,
      isPastDueDay,
      overdueStage: isPast10th
        ? "overdue_past_10th"
        : isPastDueDay
          ? "past_due_day"
          : "due_before_10th",
      reminderCount: reminder?.reminderCount || 0,
      lastRemindedAt: reminder?.sentAt || null,
    };
  });

  return res.status(200).json({
    success: true,
    month: currentMonth,
    isPast10th,
    count: enriched.length,
    overdueTenants: enriched,
  });
});

module.exports = { getOverdueTenants };
