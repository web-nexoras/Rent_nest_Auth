const express = require("express");
const router = express.Router();

const {
  getAdminDashboardStats,
} = require("../../controllers/dashboard/admin/dashboardStats");
const {
  getTenantDashboard,
} = require("../../controllers/dashboard/tenant/dashboardSummary");
const { getAllTenants } = require("../../controllers/tenants/getAllTenants");
const { getPendingUsers } = require("../../controllers/tenants/getPendingUsers");
const { removeTenant } = require("../../controllers/tenants/removeTenant");
const {
  toggleTenantActive,
} = require("../../controllers/tenants/toggleTenantActive");
const {
  updateApprovalStatus,
} = require("../../controllers/tenants/updateApprovalStatus");
const {
  createTenantByAdmin,
} = require("../../controllers/tenants/createTenantByAdmin");
const {
  updateTenantByAdmin,
} = require("../../controllers/tenants/updateTenantByAdmin");

const { adminOnly } = require("../../middlewares/adminOnly");
const { requireApproved } = require("../../middlewares/requireApproved");
const { cacheGet, clearCacheOnSuccess } = require("../../middlewares/redisCache");

const clearAll = clearCacheOnSuccess("admin", "units", "tenants", "payments", "tenant");

// Admin dashboard & tenant lifecycle routes
router.get("/", adminOnly, cacheGet("admin", 20), getAdminDashboardStats);
router.get("/tenants", adminOnly, cacheGet("tenants", 20), getAllTenants);
router.get("/pending", adminOnly, cacheGet("tenants", 20), getPendingUsers);
router.post("/tenants/create", adminOnly, clearAll, createTenantByAdmin);
router.put("/tenants/:id", adminOnly, clearAll, updateTenantByAdmin);
router.patch("/tenants/:id", adminOnly, clearAll, updateTenantByAdmin);
router.delete("/tenants/:id", adminOnly, clearAll, removeTenant);
router.patch("/tenants/:id/toggle-active", adminOnly, clearAll, toggleTenantActive);
router.patch("/tenants/:id/approval", adminOnly, clearAll, updateApprovalStatus);

// Tenant dashboard summary route
router.get("/tenant", requireApproved, cacheGet("tenant", 15), getTenantDashboard);

module.exports = router;
