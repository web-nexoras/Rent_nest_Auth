const express = require("express");
const router = express.Router();
const allMaintenance = require("./allMaintenance.js");
const { authMiddleware } = require("../../middlewares/authMiddleware.js");
const { checkActive } = require("../../middlewares/checkActive.js");

router.use("/maintenance", authMiddleware, checkActive, allMaintenance);

module.exports = router;
