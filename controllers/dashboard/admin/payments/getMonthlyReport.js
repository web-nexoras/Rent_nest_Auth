const { asyncHandler } = require("../../../../middlewares/asyncHandler");
const paymentSchema = require("../../../../models/paymentSchema");
const authSchema = require("../../../../models/authSchema");
const { getCurrentMonth, isValidMonth } = require("../../../../helpers/month");

const getMonthlyReport = asyncHandler(async (req, res) => {
  const month = req.query.month || getCurrentMonth();
  if (!isValidMonth(month)) return res.status(400).json({ success: false, message: "Month must be in YYYY-MM format" });

  const [tenants, summary, statusCounts] = await Promise.all([
    authSchema.find({ role: "tenant", approvalStatus: "approved", isActive: true, assignedUnit: { $ne: null } }).select("name email assignedUnit").populate("assignedUnit", "unitNumber rentAmount"),
    paymentSchema.aggregate([
      { $match: { month } },
      { $group: { _id: null, submitted: { $sum: "$amount" }, verified: { $sum: { $cond: [{ $eq: ["$status", "verified"] }, "$amount", 0] } }, count: { $sum: 1 } } },
    ]),
    paymentSchema.aggregate([{ $match: { month } }, { $group: { _id: "$status", count: { $sum: 1 }, amount: { $sum: "$amount" } } }]),
  ]);

  const payments = await paymentSchema.find({ month }).select("tenant amount status");
  const byTenant = new Map(payments.map((payment) => [String(payment.tenant), payment]));
  const rows = tenants.map((tenant) => {
    const payment = byTenant.get(String(tenant._id));
    return {
      tenant: { id: tenant._id, name: tenant.name, email: tenant.email },
      unit: tenant.assignedUnit,
      rentDue: tenant.assignedUnit.rentAmount,
      amountSubmitted: payment?.amount || 0,
      paymentStatus: payment?.status || "unpaid",
      outstanding: payment?.status === "verified" ? 0 : tenant.assignedUnit.rentAmount,
    };
  });
  const totals = summary[0] || { submitted: 0, verified: 0, count: 0 };
  return res.json({ success: true, month, totals: { activeUnits: tenants.length, submittedAmount: totals.submitted, collectedAmount: totals.verified, outstandingAmount: rows.reduce((sum, row) => sum + row.outstanding, 0), paymentCount: totals.count, byStatus: statusCounts }, tenants: rows });
});

module.exports = { getMonthlyReport };
