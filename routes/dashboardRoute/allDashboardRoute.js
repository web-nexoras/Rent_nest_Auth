const express = require("express");
const router = express.Router();

// ----------controllers
const {
  getAdminDashboardStats,
} = require("../../controllers/dashboard/dashboradStatus");
const { getAllTenants } = require("../../controllers/dashboard/getAllTenants");
const {
  getPendingUsers,
} = require("../../controllers/dashboard/getPendingUsers");
const { removeTenant } = require("../../controllers/dashboard/removeTenant");
const {
  toggleTenantActive,
} = require("../../controllers/dashboard/toggleTenantActive");
const {
  updateApprovalStatus,
} = require("../../controllers/dashboard/updateApprovalStatus");

// ----------middlewares
const { adminOnly } = require("../../middlewares/adminOnly");

router.get("/", adminOnly, getAdminDashboardStats);
router.get("/tenants", adminOnly, getAllTenants);
router.get("/pending", adminOnly, getPendingUsers);
router.delete("/tenants/:id", adminOnly, removeTenant);
router.patch("/tenants/:id/toggle-active", adminOnly, toggleTenantActive);
router.patch("/tenants/:id/approval", adminOnly, updateApprovalStatus);

module.exports = router;
