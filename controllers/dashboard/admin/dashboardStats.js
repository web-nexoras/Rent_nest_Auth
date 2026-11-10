const { asyncHandler } = require("../../../middlewares/asyncHandler");
const authSchema = require("../../../models/authSchema");
const unitSchema = require("../../../models/unitSchema");
const paymentSchema = require("../../../models/paymentSchema");
const maintenanceSchema = require("../../../models/maintenanceSchema");
const { getCurrentMonth } = require("../../../helpers/month");

const getAdminDashboardStats = asyncHandler(async (req, res) => {
  const currentMonth = getCurrentMonth();
  const now = new Date();
  const dayOfMonth = now.getDate();
  const isPast10th = dayOfMonth > 10;

  const [
    totalUnits,
    occupiedUnitsDocs,
    totalTenants,
    pendingApprovals,
    pendingMaintenanceCount,
    collectionResult,
    pendingPaymentCount,
    paidTenantIds,
    revenueRows,
  ] = await Promise.all([
    unitSchema.countDocuments({}),
    unitSchema.find({ status: "occupied" }).select("rentAmount").lean(),
    authSchema.countDocuments({ role: "tenant", approvalStatus: "approved" }),
    authSchema.countDocuments({ role: "tenant", approvalStatus: "pending" }),
    maintenanceSchema.countDocuments({ status: "pending" }),
    paymentSchema.aggregate([
      { $match: { month: currentMonth, status: "verified" } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
    paymentSchema.countDocuments({ month: currentMonth, status: "pending" }),
    paymentSchema.distinct("tenant", {
      month: currentMonth,
      status: { $in: ["pending", "verified"] },
    }),
    paymentSchema.aggregate([
      { $match: { status: "verified" } },
      { $group: { _id: "$month", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
      { $limit: 6 },
    ]),
  ]);

  const occupiedUnits = occupiedUnitsDocs.length;
  const expectedMonthlyRevenue = occupiedUnitsDocs.reduce(
    (sum, u) => sum + Number(u.rentAmount || 0),
    0,
  );

  const unpaidTenantsCount = await authSchema.countDocuments({
    role: "tenant",
    approvalStatus: "approved",
    isActive: true,
    assignedUnit: { $ne: null },
    _id: { $nin: paidTenantIds },
  });

  const thisMonthCollection = collectionResult[0]?.total || 0;
  const paidUnitsCount = collectionResult[0]?.count || 0;

  return res.status(200).json({
    success: true,
    month: currentMonth,
    dayOfMonth,
    isPast10th,
    stats: {
      totalUnits,
      occupiedUnits,
      vacantUnits: Math.max(0, totalUnits - occupiedUnits),
      paidUnitsCount,
      pendingPaymentCount,
      unpaidUnitsCount: unpaidTenantsCount,
      totalTenants,
      pendingApprovals,
      expectedMonthlyRevenue,
      thisMonthCollection,
      outstandingRevenue: Math.max(0, expectedMonthlyRevenue - thisMonthCollection),
      overdueTenantsCount: unpaidTenantsCount,
      strictOverdueCount: isPast10th ? unpaidTenantsCount : 0,
      pendingMaintenanceCount,
      revenueTrend: revenueRows
        .map((row) => ({
          month: row._id,
          total: row.total,
          count: row.count,
        }))
        .reverse(),
    },
  });
});

module.exports = { getAdminDashboardStats };
