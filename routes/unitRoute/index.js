const express = require("express");
const router = express.Router();

const allUnitsRoutes = require ('./allUnitsRoutes.js')


// --------middlewere 
const { authMiddleware } = require("../../middlewares/authMiddleware.js");
const { checkActive } = require("../../middlewares/checkActive.js");

router.use("/unit", authMiddleware, checkActive)
router.use("/unit", allUnitsRoutes);


module.exports = router;
