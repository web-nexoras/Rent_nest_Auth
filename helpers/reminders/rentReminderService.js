const authSchema = require("../../models/authSchema");
const paymentSchema = require("../../models/paymentSchema");
const rentReminderSchema = require("../../models/rentReminderSchema");
const unitSchema = require("../../models/unitSchema");
const { getCurrentMonth } = require("../month");
const { sendNoticeEmail } = require("../email/mailService");
const { invalidateCache } = require("../../middlewares/redisCache");

const getTodayKey = (now = new Date()) =>
  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;

// 2-stage reminder logic: initial due alert after rentDueDay, daily overdue notice from the 10th onward
const sendSingleTenantReminder = async ({
  tenant,
  unit,
  month = getCurrentMonth(),
  forceManual = false,
  customNote = "",
}) => {
  const now = new Date();
  const dayOfMonth = now.getDate();
  const todayKey = getTodayKey(now);
  const currentMonthStr = getCurrentMonth();
  const isPastMonth = month < currentMonthStr;
  const isCurrentMonth = month === currentMonthStr;
  const dueDay = unit.rentDueDay || 5;

  const isOverdueStage = isPastMonth || (isCurrentMonth && dayOfMonth >= 10);
  const isInitialAlertStage =
    !isOverdueStage && isCurrentMonth && dayOfMonth > dueDay;

  if (!forceManual && !isOverdueStage && !isInitialAlertStage) {
    return { sent: false, reason: "Not past due date yet" };
  }

  let record = await rentReminderSchema.findOne({ tenant: tenant._id, month });

  // Prevent duplicate automatic alerts on the same stage/day
  if (!forceManual && record) {
    if (isInitialAlertStage && record.firstAlertSentAt) {
      return { sent: false, reason: "Initial due alert already sent" };
    }
    if (isOverdueStage && record.lastOverdueSentDate === todayKey) {
      return { sent: false, reason: "Overdue reminder already sent today" };
    }
  }

  const stage = forceManual
    ? "manual_admin"
    : isOverdueStage
      ? "overdue_10th"
      : "due_alert";

  const subject = isOverdueStage
    ? `URGENT: Overdue Rent Reminder for ${month} (Unit ${unit.unitNumber})`
    : `Rent Due Alert for ${month} (Unit ${unit.unitNumber})`;

  const title = isOverdueStage
    ? `Overdue Rent Notice — Unit ${unit.unitNumber}`
    : `Upcoming / Due Rent Alert — Unit ${unit.unitNumber}`;

  const defaultMessage = isOverdueStage
    ? `Hello ${tenant.name}, your monthly rent for ${month} is past the 10th deadline and is now marked OVERDUE. Please complete your payment immediately via SSLCommerz or your tenant dashboard.`
    : `Hello ${tenant.name}, this is a gentle alert that your rent for ${month} is due (Due Day: ${dueDay}). Please pay on or before the 10th to avoid overdue status.`;

  const finalMessage = customNote ? `${defaultMessage}\n\nAdmin Note: ${customNote}` : defaultMessage;

  if (!record) {
    record = await rentReminderSchema.create({
      tenant: tenant._id,
      unit: unit._id,
      month,
      sentAt: now,
      firstAlertSentAt: now,
      lastOverdueSentDate: isOverdueStage ? todayKey : null,
      reminderCount: 1,
      lastStage: stage,
      lastMessage: finalMessage,
    });
  } else {
    record.sentAt = now;
    record.unit = unit._id;
    record.reminderCount = (record.reminderCount || 1) + 1;
    record.lastStage = stage;
    record.lastMessage = finalMessage;
    if (!record.firstAlertSentAt) record.firstAlertSentAt = now;
    if (isOverdueStage) record.lastOverdueSentDate = todayKey;
    await record.save();
  }

  try {
    await sendNoticeEmail({
      email: tenant.email,
      subject,
      title,
      message: finalMessage,
      details: {
        Unit: unit.unitNumber,
        "Billing Month": month,
        "Fixed Rent Due": `${unit.rentAmount} BDT`,
        Status: isOverdueStage ? "OVERDUE (Past 10th)" : "Due (Pay by 10th)",
        "Reminder Count": `#${record.reminderCount}`,
      },
    });
  } catch (error) {
    console.error(`Rent reminder email failed for ${tenant.email}:`, error.message);
  }

  return { sent: true, reminder: record };
};

// Send reminders to all active tenants who have not paid for the target month
const sendMonthlyRentReminders = async ({ forceManual = false, month = getCurrentMonth(), customNote = "" } = {}) => {
  const tenants = await authSchema
    .find({
      role: "tenant",
      approvalStatus: "approved",
      isActive: true,
      assignedUnit: { $ne: null },
    })
    .select("name email phone assignedUnit");

  let sentCount = 0;
  const results = [];

  for (const tenant of tenants) {
    const payment = await paymentSchema
      .findOne({
        tenant: tenant._id,
        month,
        status: { $in: ["pending", "verified"] },
      })
      .select("_id");

    if (payment) continue;

    const unit = await unitSchema
      .findById(tenant.assignedUnit)
      .select("unitNumber rentAmount rentDueDay");
    if (!unit) continue;

    const outcome = await sendSingleTenantReminder({
      tenant,
      unit,
      month,
      forceManual,
      customNote,
    });

    if (outcome.sent) {
      sentCount += 1;
      results.push({
        tenantId: tenant._id,
        name: tenant.name,
        unitNumber: unit.unitNumber,
        reminderCount: outcome.reminder.reminderCount,
      });
    }
  }

  if (sentCount > 0) {
    await invalidateCache("admin", "units", "payments", "tenant");
  }

  return { sentCount, results };
};

module.exports = {
  sendSingleTenantReminder,
  sendMonthlyRentReminders,
};
