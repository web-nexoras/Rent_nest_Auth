const authSchema = require("../../../models/authSchema");
const paymentSchema = require("../../../models/paymentSchema");
const maintenanceSchema = require("../../../models/maintenanceSchema");
const noticeSchema = require("../../../models/noticeShcema");
const { asyncHandler } = require("../../../middlewares/asyncHandler");
const { getCurrentMonth } = require("../../../helpers/month");

// Tenant only.
const getTenantDashboard = asyncHandler(async (req, res) => {
  const currentMonth = getCurrentMonth();

  const user = await authSchema
    .findById(req.user._id)
    .populate("assignedUnit", "unitNumber floor rentAmount rentDueDay");
  const recentNotices = await noticeSchema.find().sort({ createdAt: -1 }).limit(5).select("title description createdAt");

  if (!user.assignedUnit) {
    return res.status(200).json({
      success: true,
      message: "No unit assigned yet",
      unit: null,
      currentMonth,
      dueStatus: null,
      recentPayments: [],
      pendingMaintenanceCount: 0,
      recentMaintenance: [],
      recentNotices,
    });
  }

  const [currentMonthPayment, recentPayments, pendingMaintenanceCount, recentMaintenance] =
    await Promise.all([
      paymentSchema.findOne({
        tenant: req.user._id,
        month: currentMonth,
      }),
      paymentSchema.find({ tenant: req.user._id }).sort({ month: -1 }).limit(5),
      maintenanceSchema.countDocuments({
        tenant: req.user._id,
        status: { $ne: "resolved" },
      }),
      maintenanceSchema.find({ tenant: req.user._id }).sort({ updatedAt: -1 }).limit(3).select("category description status createdAt updatedAt"),
    ]);

  const [year, monthNumber] = currentMonth.split("-").map(Number);
  const monthLastDay = new Date(year, monthNumber, 0).getDate();
  const rentDueDate = new Date(year, monthNumber - 1, Math.min(user.assignedUnit.rentDueDay || 1, monthLastDay));
  rentDueDate.setHours(23, 59, 59, 999);

  let dueStatus;
  if (!currentMonthPayment) {
    dueStatus = {
      status: "unpaid",
      amountDue: user.assignedUnit.rentAmount,
      dueDate: rentDueDate,
      isOverdue: new Date() > rentDueDate,
      message: `Rent for ${currentMonth} has not been submitted yet`,
    };
  } else if (currentMonthPayment.status === "pending") {
    dueStatus = {
      status: "pending_verification",
      amountDue: 0,
      dueDate: rentDueDate,
      isOverdue: false,
      message: `Payment for ${currentMonth} submitted, awaiting admin verification`,
    };
  } else if (currentMonthPayment.status === "verified") {
    dueStatus = {
      status: "paid",
      amountDue: 0,
      dueDate: rentDueDate,
      isOverdue: false,
      message: `Rent for ${currentMonth} is paid`,
    };
  } else {
    // rejected — treat as still unpaid
    dueStatus = {
      status: "unpaid",
      amountDue: user.assignedUnit.rentAmount,
      dueDate: rentDueDate,
      isOverdue: new Date() > rentDueDate,
      message: `Your last payment for ${currentMonth} was rejected. Please resubmit.`,
    };
  }

  return res.status(200).json({
    success: true,
    unit: user.assignedUnit,
    currentMonth,
    dueStatus,
    recentPayments,
    pendingMaintenanceCount,
    recentMaintenance,
    recentNotices,
  });
});

module.exports = { getTenantDashboard };
