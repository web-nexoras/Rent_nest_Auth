const unitSchema = require("../../models/unitSchema");
const paymentSchema = require("../../models/paymentSchema");
const rentReminderSchema = require("../../models/rentReminderSchema");
const { asyncHandler } = require("../../middlewares/asyncHandler");
const { getCurrentMonth, isValidMonth } = require("../../helpers/month");

// Live occupancy, payment, and 10th-of-month overdue matrix across all building units
const getUnitStatusMatrix = asyncHandler(async (req, res) => {
  const month = req.query.month || getCurrentMonth();

  if (!isValidMonth(month)) {
    return res.status(400).json({
      success: false,
      message: "Month must be in YYYY-MM format",
    });
  }

  const [units, payments, reminders] = await Promise.all([
    unitSchema
      .find({})
      .populate("assignedTenant", "name email phone nidNumber occupation isActive")
      .lean(),
    paymentSchema
      .find({ month })
      .select("unit tenant amount status paymentMethod transactionId paidAt verifiedAt")
      .lean(),
    rentReminderSchema
      .find({ month })
      .select("tenant sentAt reminderCount lastStage")
      .lean(),
  ]);

  // Natural sort: A-101 .. L-1204
  units.sort((a, b) =>
    String(a.unitNumber).localeCompare(String(b.unitNumber), undefined, {
      numeric: true,
      sensitivity: "base",
    }),
  );

  const paymentByUnit = new Map(payments.map((p) => [String(p.unit), p]));
  const reminderByTenant = new Map(reminders.map((r) => [String(r.tenant), r]));

  const now = new Date();
  const currentMonthStr = getCurrentMonth();
  const isPastMonth = month < currentMonthStr;
  const isCurrentMonth = month === currentMonthStr;
  const dayOfMonth = now.getDate();
  const isPast10th = isPastMonth || (isCurrentMonth && dayOfMonth > 10);

  let vacantCount = 0;
  let occupiedCount = 0;
  let paidCount = 0;
  let pendingCount = 0;
  let unpaidCount = 0;
  let overdueCount = 0;
  let expectedRevenue = 0;
  let collectedRevenue = 0;

  const matrix = units.map((unit) => {
    const isOccupied = Boolean(unit.assignedTenant);
    if (!isOccupied) {
      vacantCount += 1;
      return {
        ...unit,
        occupancyStatus: "vacant",
        paymentStatus: "vacant",
        isOverdue: false,
        isPastDueDay: false,
        payment: null,
        reminder: null,
      };
    }

    occupiedCount += 1;
    expectedRevenue += Number(unit.rentAmount || 0);

    const payment = paymentByUnit.get(String(unit._id)) || null;
    const reminder = reminderByTenant.get(String(unit.assignedTenant._id)) || null;
    const dueDay = unit.rentDueDay || 5;
    const isPastDueDay = isPastMonth || (isCurrentMonth && dayOfMonth > dueDay);

    let paymentStatus = "unpaid";
    let isOverdue = false;

    if (payment?.status === "verified") {
      paymentStatus = "paid";
      paidCount += 1;
      collectedRevenue += Number(payment.amount || unit.rentAmount || 0);
    } else if (payment?.status === "pending") {
      paymentStatus = "pending";
      pendingCount += 1;
    } else {
      unpaidCount += 1;
      if (isPast10th) {
        paymentStatus = "overdue";
        isOverdue = true;
        overdueCount += 1;
      } else if (isPastDueDay) {
        paymentStatus = "due_alert";
      } else {
        paymentStatus = "due";
      }
    }

    return {
      ...unit,
      occupancyStatus: "occupied",
      paymentStatus,
      isOverdue,
      isPastDueDay,
      payment,
      reminder: reminder
        ? {
            sentAt: reminder.sentAt,
            reminderCount: reminder.reminderCount || 1,
            lastStage: reminder.lastStage || "due_alert",
          }
        : null,
    };
  });

  return res.status(200).json({
    success: true,
    month,
    isPast10th,
    dayOfMonth,
    summary: {
      totalUnits: units.length,
      vacantUnits: vacantCount,
      occupiedUnits: occupiedCount,
      paidUnits: paidCount,
      pendingUnits: pendingCount,
      unpaidUnits: unpaidCount,
      overdueUnits: overdueCount,
      expectedRevenue,
      collectedRevenue,
      outstandingRevenue: Math.max(0, expectedRevenue - collectedRevenue),
    },
    units: matrix,
  });
});

module.exports = { getUnitStatusMatrix };
