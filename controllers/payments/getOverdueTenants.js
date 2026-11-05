const { asyncHandler } = require("../../middlewares/asyncHandler");
const authSchema = require("../../models/authSchema");
const paymentSchema = require("../../models/paymentSchema");
const { getCurrentMonth, isValidMonth } = require("../../helpers/month");

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

  const overdueTenants = await authSchema
    .find({
      role: "tenant",
      approvalStatus: "approved",
      isActive: true,
      assignedUnit: { $ne: null },
      _id: { $nin: paidTenantIds },
    })
    .select("name email phone assignedUnit")
    .populate("assignedUnit", "unitNumber floor rentAmount");

  return res.status(200).json({
    success: true,
    month: currentMonth,
    count: overdueTenants.length,
    overdueTenants,
  });
});

module.exports = { getOverdueTenants };