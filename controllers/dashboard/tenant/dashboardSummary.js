const authSchema = require("../../../models/authSchema");
const paymentSchema = require("../../../models/paymentSchema");
const maintenanceSchema = require("../../../models/maintenanceSchema");
const noticeSchema = require("../../../models/noticeSchema");
const rentReminderSchema = require("../../../models/rentReminderSchema");
const { asyncHandler } = require("../../../middlewares/asyncHandler");
const { getCurrentMonth } = require("../../../helpers/month");

const getTenantDashboard = asyncHandler(async (req, res) => {
  const currentMonth = getCurrentMonth();

  const user = await authSchema
    .findById(req.user._id)
    .populate(
      "assignedUnit",
      "unitNumber floor sizeSqft bedrooms rentAmount rentDueDay description images assignedMonth",
    );
  const recentNotices = await noticeSchema
    .find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("title description createdAt");

  if (!user.assignedUnit) {
    return res.status(200).json({
      success: true,
      message: "No unit assigned yet",
      unit: null,
      currentMonth,
      dueStatus: null,
      reminder: null,
      recentPayments: [],
      pendingMaintenanceCount: 0,
      recentMaintenance: [],
      recentNotices,
    });
  }

  const [
    currentMonthPayment,
    recentPayments,
    pendingMaintenanceCount,
    recentMaintenance,
    reminder,
  ] = await Promise.all([
    currentMonth >= (user.assignedUnit.assignedMonth || currentMonth)
      ? paymentSchema.findOne({
          tenant: req.user._id,
          unit: user.assignedUnit._id,
          month: currentMonth,
        })
      : Promise.resolve(null),
    paymentSchema
      .find({
        tenant: req.user._id,
        unit: user.assignedUnit._id,
        month: {
          $gte: user.assignedUnit.assignedMonth || currentMonth,
        },
      })
      .sort({ month: -1 })
      .limit(12),
    maintenanceSchema.countDocuments({
      tenant: req.user._id,
      status: { $ne: "resolved" },
    }),
    maintenanceSchema
      .find({ tenant: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(3)
      .select("category description status createdAt updatedAt"),
    rentReminderSchema.findOne({
      tenant: req.user._id,
      month: currentMonth,
    }),
  ]);

  // Compute due date and 10th-of-month overdue deadline
  const now = new Date();
  const [year, monthNumber] = currentMonth.split("-").map(Number);
  const monthLastDay = new Date(year, monthNumber, 0).getDate();
  const dueDay = Math.min(user.assignedUnit.rentDueDay || 5, monthLastDay);
  const rentDueDate = new Date(year, monthNumber - 1, dueDay, 23, 59, 59, 999);
  const tenthDeadline = new Date(year, monthNumber - 1, 10, 23, 59, 59, 999);

  const dayOfMonth = now.getDate();
  const isPastDueDay = dayOfMonth > dueDay;
  const isPast10th = dayOfMonth > 10;
  const daysUntil10th = Math.max(0, 10 - dayOfMonth);

  let dueStatus;
  if (!currentMonthPayment) {
    dueStatus = {
      status: "unpaid",
      amountDue: user.assignedUnit.rentAmount,
      dueDate: rentDueDate,
      overdueDeadline: tenthDeadline,
      isPastDueDay,
      isOverdue: isPast10th,
      daysUntil10th,
      message: isPast10th
        ? `OVERDUE: Rent for ${currentMonth} passed the 10th deadline. Please pay immediately.`
        : isPastDueDay
          ? `ALERT: Rent due date (Day ${dueDay}) has passed. Pay before the 10th (${daysUntil10th} day${daysUntil10th === 1 ? "" : "s"} left) to avoid Overdue status.`
          : `Rent for ${currentMonth} is due by Day ${dueDay} (Overdue after the 10th).`,
    };
  } else if (currentMonthPayment.status === "pending") {
    dueStatus = {
      status: "pending_verification",
      amountDue: 0,
      dueDate: rentDueDate,
      overdueDeadline: tenthDeadline,
      isPastDueDay: false,
      isOverdue: false,
      daysUntil10th,
      message: `Payment for ${currentMonth} submitted, awaiting admin verification`,
    };
  } else if (currentMonthPayment.status === "verified") {
    dueStatus = {
      status: "paid",
      amountDue: 0,
      dueDate: rentDueDate,
      overdueDeadline: tenthDeadline,
      isPastDueDay: false,
      isOverdue: false,
      daysUntil10th,
      message: `Rent for ${currentMonth} is paid & verified`,
    };
  } else {
    dueStatus = {
      status: "unpaid",
      amountDue: user.assignedUnit.rentAmount,
      dueDate: rentDueDate,
      overdueDeadline: tenthDeadline,
      isPastDueDay,
      isOverdue: isPast10th,
      daysUntil10th,
      message: `Your last payment for ${currentMonth} was rejected. Please resubmit.`,
    };
  }

  return res.status(200).json({
    success: true,
    unit: user.assignedUnit,
    currentMonth,
    dueStatus,
    reminder: reminder
      ? {
          sentAt: reminder.sentAt,
          reminderCount: reminder.reminderCount || 1,
          lastStage: reminder.lastStage,
          lastMessage: reminder.lastMessage,
        }
      : null,
    recentPayments,
    pendingMaintenanceCount,
    recentMaintenance,
    recentNotices,
  });
});

module.exports = { getTenantDashboard };
