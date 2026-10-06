const express = require("express");
const router = express.Router();

const baseUrl = process.env.BASE_URL;
const authRoutes = require("./authRoute");
const noticeRoutes = require("./noticeRoute");
const unitRoutes = require ('./unitRoute')
const maintenanceRoutes = require("./maintenanceRoute/inedex");
const teantRoutes = require("./teant");
router.use(baseUrl || "/api/v1", authRoutes);
router.use(baseUrl || "/api/v1", noticeRoutes);
router.use(baseUrl || "/api/v1", unitRoutes);
router.use(baseUrl || "/api/v1", maintenanceRoutes);
router.use(baseUrl || "/api/v1", teantRoutes);

module.exports = router;
