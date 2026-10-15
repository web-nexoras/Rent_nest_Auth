const express = require("express");
const router = express.Router();

const { adminOnly } = require("../../middlewares/adminOnly");
const {
  getAdminDashboardStats,
} = require("../../controllers/dashboard/dashboradStatus");

// Mounted at /api/v1/dashboard/admin after authentication and active-account checks.
router.get("/", adminOnly, getAdminDashboardStats);

module.exports = router;
