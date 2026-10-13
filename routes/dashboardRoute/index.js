const express = require("express");
const router = express.Router();

const allAdmins = require("./allDashboardRoute");

// --------middlewere
const { authMiddleware } = require("../../middlewares/authMiddleware.js");
const { checkActive } = require("../../middlewares/checkActive.js");
const { requireApproved } = require("../../middlewares/requireApproved.js");
const { getTenantDashboard } = require("../../controllers/admin/getTenantDashboard");

router.use("/admin", authMiddleware, checkActive);
router.use("/admin", allAdmins);

router.get("/tenant", authMiddleware, checkActive, requireApproved, getTenantDashboard);

module.exports = router;
