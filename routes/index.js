const express = require("express");
const router = express.Router();

const baseUrl = process.env.BASE_URL;
const authRoutes = require("./authRoute");
const noticeRoutes = require("./noticeRoute");
const unitRoutes = require ('./unitRoute')
const maintenanceRoutes = require("./maintenanceRoute/inedex");
const dashboardRoutes = require("./dashboardRoute");
const paymentRoutes = require("./paymentRoute");
router.use(baseUrl || "/api/v1", authRoutes);
router.use(baseUrl || "/api/v1", noticeRoutes);
router.use(baseUrl || "/api/v1", unitRoutes);
router.use(baseUrl || "/api/v1", maintenanceRoutes);
router.use(baseUrl || "/api/v1", paymentRoutes);
router.use(`${baseUrl || "/api/v1"}/dashboard`, dashboardRoutes);

module.exports = router;
