const express = require("express");
const router = express.Router();

const allAdmins = require("./allDashboardRoute");

// --------middlewere
const { authMiddleware } = require("../../middlewares/authMiddleware.js");
const { checkActive } = require("../../middlewares/checkActive.js");

router.use("/admin", authMiddleware, checkActive);
router.use("/admin", allAdmins);

module.exports = router;
