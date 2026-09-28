const express = require("express");
const router = express.Router();

const baseUrl = process.env.BASE_URL;
const authRoutes = require("./authRoute");
const noticeRoutes = require("./noticeRoute");
const unitRoutes = require ('./unitRoute')

router.use(baseUrl || "/api/v1", authRoutes);
router.use(baseUrl || "/api/v1", noticeRoutes);
router.use(baseUrl || "/api/v1", unitRoutes);

module.exports = router;
