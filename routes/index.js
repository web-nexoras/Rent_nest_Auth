const express = require("express");
const router = express.Router();

const baseUrl = process.env.BASE_URL;
const authRoutes = require("./authRoute");
const noticeRoutes = require("./noticeRoute");

router.use(baseUrl || "/api/v1", authRoutes);
router.use(baseUrl || "/api/v1", noticeRoutes);

module.exports = router;
