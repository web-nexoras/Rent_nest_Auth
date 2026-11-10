const express = require("express");
const router = express.Router();
const allAdmins = require("./allDashboardRoute");
const { authMiddleware } = require("../../middlewares/authMiddleware.js");
const { checkActive } = require("../../middlewares/checkActive.js");

router.use("/admin", authMiddleware, checkActive, allAdmins);

module.exports = router;
