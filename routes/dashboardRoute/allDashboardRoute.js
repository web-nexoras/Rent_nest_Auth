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
  getTenantDashboard,
} = require("../../controllers/dashboard/tenant/dashboardSummary");

// ----------middlewares
const { adminOnly } = require("../../middlewares/adminOnly");
const { requireApproved } = require("../../middlewares/requireApproved");

// --------admin dashboard
router.get("/", adminOnly, getAdminDashboardStats);
router.get("/tenants", adminOnly, getAllTenants);
router.get("/pending", adminOnly, getPendingUsers);
router.delete("/tenants/:id", adminOnly, removeTenant);
router.patch("/tenants/:id/toggle-active", adminOnly, toggleTenantActive);
router.patch("/tenants/:id/approval", adminOnly, updateApprovalStatus);

// ---------tenant dashboard
router.get("/tenant", requireApproved, getTenantDashboard);

module.exports = router;
