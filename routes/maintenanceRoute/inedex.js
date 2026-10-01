const express = require("express");
const router = express.Router();

const allMantenece = require("./allMaintenance.js");

// --------middlewere
const { authMiddleware } = require("../../middlewares/authMiddleware.js");
const { checkActive } = require("../../middlewares/checkActive.js");

router.use("/maintenance", authMiddleware, checkActive);
router.use("/maintenance", allMantenece);

module.exports = router;
