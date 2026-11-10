const express = require("express");
const router = express.Router();
const allUnitsRoutes = require("./allUnitsRoutes.js");
const { authMiddleware } = require("../../middlewares/authMiddleware.js");
const { checkActive } = require("../../middlewares/checkActive.js");

router.use("/unit", authMiddleware, checkActive, allUnitsRoutes);

module.exports = router;
