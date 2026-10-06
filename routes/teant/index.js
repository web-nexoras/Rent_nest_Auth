const express = require("express");
const router = express.Router();

const allTenantRoutes = require ('./allTenantroutes.js')


// --------middlewere 
const { authMiddleware } = require("../../middlewares/authMiddleware.js");
const { checkActive } = require("../../middlewares/checkActive.js");

router.use("/tenant", authMiddleware, checkActive)
router.use("/tenant", allTenantRoutes);


module.exports = router;
