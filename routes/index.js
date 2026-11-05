const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const baseUrl = process.env.BASE_URL || "/api/v1";
const authRoutes = require("./authRoute");
const noticeRoutes = require("./noticeRoute");
const unitRoutes = require("./unitRoute");
const paymentRoutes = require("./paymentRoute");
const maintenanceRoutes = require("./maintenanceRoute/inedex");
const dashboardRoutes = require("./dashboardRoute");

const health = (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  return res.status(dbReady ? 200 : 503).json({
    success: dbReady,
    message: dbReady ? "Rent Nest API is running" : "Database is not connected",
  });
};

router.get("/health", health);
router.get(`${baseUrl}/health`, health);

router.use(baseUrl, authRoutes);
router.use(baseUrl, noticeRoutes);
router.use(baseUrl, unitRoutes);
router.use(baseUrl, paymentRoutes);
router.use(baseUrl, maintenanceRoutes);
router.use(baseUrl, dashboardRoutes);

router.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

module.exports = router;
