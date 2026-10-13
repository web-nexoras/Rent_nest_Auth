const express = require("express");
const router = express.Router();

const { adminOnly } = require("../../middlewares/adminOnly");
const {
  getAdminDashboardStats,
} = require("../../controllers/admin/dashboradStatus");
const { getRevenueTrend } = require("../../controllers/admin/getRevenueTrend");

// Mounted at /api/v1/dashboard/admin after authentication and active-account checks.
router.get("/", adminOnly, getAdminDashboardStats);
router.get("/revenue-trend", adminOnly, getRevenueTrend);

module.exports = router;
