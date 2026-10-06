const express = require("express");
const router = express.Router();

const noticeRoutes = require("./allNoticeRoutes");
const { authMiddleware } = require("../../middlewares/authMiddleware");
const { checkActive } = require("../../middlewares/checkActive");

// All notice endpoints require an authenticated, active account.
router.use("/notice", authMiddleware, checkActive, noticeRoutes);

module.exports = router;
