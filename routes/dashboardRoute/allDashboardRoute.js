const express = require("express");
const router = express.Router();

// ----------controllers
const {
  getAdminDashboardStats,
} = require("../../controllers/dashboard/admin/dashboardStats");
const { getAllTenants } = require("../../controllers/dashboard/admin/getAllTenants");
const {
  getPendingUsers,
} = require("../../controllers/dashboard/admin/getPendingUsers");
const { removeTenant } = require("../../controllers/dashboard/admin/removeTenant");
const {
  toggleTenantActive,
} = require("../../controllers/dashboard/admin/toggleTenantActive");
const {
  updateApprovalStatus,
} = require("../../controllers/dashboard/admin/updateApprovalStatus");
const {
  createTenantByAdmin,
} = require("../../controllers/dashboard/admin/tenants/createTenantByAdmin");
const {
  updateTenantByAdmin,
} = require("../../controllers/dashboard/admin/tenants/updateTenantByAdmin");
const {
  getTenantDashboard,
} = require("../../controllers/dashboard/tenant/dashboardSummary");

// ----------middlewares
const { adminOnly } = require("../../middlewares/adminOnly");
const { requireApproved } = require("../../middlewares/requireApproved");
const { cacheGet, clearCacheOnSuccess } = require("../../middlewares/redisCache");

const clearAll = clearCacheOnSuccess("admin", "units", "tenants", "payments", "tenant");

// --------admin dashboard
router.get("/", adminOnly, cacheGet("admin", 20), getAdminDashboardStats);
router.get("/tenants", adminOnly, cacheGet("tenants", 20), getAllTenants);
router.get("/pending", adminOnly, cacheGet("tenants", 20), getPendingUsers);
router.post("/tenants/create", adminOnly, clearAll, createTenantByAdmin);
router.put("/tenants/:id", adminOnly, clearAll, updateTenantByAdmin);
router.patch("/tenants/:id", adminOnly, clearAll, updateTenantByAdmin);
router.delete("/tenants/:id", adminOnly, clearAll, removeTenant);
router.patch("/tenants/:id/toggle-active", adminOnly, clearAll, toggleTenantActive);
router.patch("/tenants/:id/approval", adminOnly, clearAll, updateApprovalStatus);

// ---------tenant dashboard
router.get("/tenant", requireApproved, cacheGet("tenant", 15), getTenantDashboard);

module.exports = router;
