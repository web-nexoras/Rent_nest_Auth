const authSchema = require("../../../models/authSchema");
const paymentSchema = require("../../../models/paymentSchema");
const maintenanceSchema = require("../../../models/maintenanceSchema");
const { asyncHandler } = require("../../../middlewares/asyncHandler");
const { getCurrentMonth } = require("../../../helpers/month");

// Tenant only.
const getTenantDashboard = asyncHandler(async (req, res) => {
  const currentMonth = getCurrentMonth();

  const user = await authSchema
    .findById(req.user._id)
    .populate("assignedUnit", "unitNumber floor rentAmount");

  if (!user.assignedUnit) {
    return res.status(200).json({
      success: true,
      message: "No unit assigned yet",
      unit: null,
      currentMonth,
      dueStatus: null,
      recentPayments: [],
      pendingMaintenanceCount: 0,
    });
  }

  const [currentMonthPayment, recentPayments, pendingMaintenanceCount] =
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
    ]);

  let dueStatus;
  if (!currentMonthPayment) {
    dueStatus = {
      status: "unpaid",
      amountDue: user.assignedUnit.rentAmount,
      message: `Rent for ${currentMonth} has not been submitted yet`,
    };
  } else if (currentMonthPayment.status === "pending") {
    dueStatus = {
      status: "pending_verification",
      amountDue: 0,
      message: `Payment for ${currentMonth} submitted, awaiting admin verification`,
    };
  } else if (currentMonthPayment.status === "verified") {
    dueStatus = {
      status: "paid",
      amountDue: 0,
      message: `Rent for ${currentMonth} is paid`,
    };
  } else {
    // rejected — treat as still unpaid
    dueStatus = {
      status: "unpaid",
      amountDue: user.assignedUnit.rentAmount,
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
  });
});

module.exports = { getTenantDashboard };
