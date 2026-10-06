const express = require("express");
const router = express.Router();

const allPaymentsRoutes = require ('./allPaymentsRoutes.js')


// --------middlewere 
const { authMiddleware } = require("../../middlewares/authMiddleware.js");
const { checkActive } = require("../../middlewares/checkActive.js");

router.use("/payment", authMiddleware, checkActive)
router.use("/payment", allPaymentsRoutes);


module.exports = router;
