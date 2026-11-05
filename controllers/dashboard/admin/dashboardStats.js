const { asyncHandler } = require("../../../middlewares/asyncHandler");
const authSchema = require("../../../models/authSchema");
const unitSchema = require("../../../models/unitSchema");
const paymentSchema = require("../../../models/paymentSchema");
const maintenanceSchema = require("../../../models/maintenanceSchema");
const { getCurrentMonth } = require("../../../helpers/month");


const getAdminDashboardStats = asyncHandler(async (req, res) => {
  const currentMonth = getCurrentMonth();

  const [
    totalUnits,
    occupiedUnits,
    totalTenants,
    pendingApprovals,
    pendingMaintenanceCount,
    collectionResult,
    paidTenantIds,
    revenueRows,
  ] = await Promise.all([
    unitSchema.countDocuments({}),
    unitSchema.countDocuments({ status: "occupied" }),
    authSchema.countDocuments({ role: "tenant", approvalStatus: "approved" }),
    authSchema.countDocuments({ role: "tenant", approvalStatus: "pending" }),
    maintenanceSchema.countDocuments({ status: "pending" }),
    paymentSchema.aggregate([
      { $match: { month: currentMonth, status: "verified" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
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

  const overdueTenantsCount = await authSchema.countDocuments({
    role: "tenant",
    approvalStatus: "approved",
    isActive: true,
    assignedUnit: { $ne: null },
    _id: { $nin: paidTenantIds },
  });

  const thisMonthCollection = collectionResult[0]?.total || 0;

  return res.status(200).json({
    success: true,
    month: currentMonth,
    stats: {
      totalUnits,
      occupiedUnits,
      vacantUnits: totalUnits - occupiedUnits,
      totalTenants,
      pendingApprovals,
      thisMonthCollection,
      overdueTenantsCount,
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
