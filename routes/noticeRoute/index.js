const express = require("express");
const router = express.Router();

const allnotices = require("./allNoticeRoutes.js");

// --------middlewere
const { authMiddleware } = require("../../middlewares/authMiddleware.js");
const { checkActive } = require("../../middlewares/checkActive.js");

router.use("/notice", authMiddleware, checkActive);
router.use("/notice", allnotices);

module.exports = router;
