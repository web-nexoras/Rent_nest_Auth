const express = require("express");
const router = express.Router();

const createUnit = require ('./getallNotice.js')
const getAllUnits = require ('./getSingleNotice.js')
const getSingleUnit = require ('./createNotice.js')
const deleteUnit  = require ('./updateNotice.js')
const updateUnit  = require ('./deleteNotice.js')
const assignTenant  = require ('./addComment.js')
const unassignTenant = require ('./deleteComment.js');

// --------middlewere 
const { authMiddleware } = require("../../middlewares/authMiddleware.js");
const { checkActive } = require("../../middlewares/checkActive.js");



router.use("/unit", authMiddleware, checkActive)
router.use("/unit", getallNotice);
router.use("/unit", getNotice);
router.use("/unit", createNotice);
router.use("/unit", updateNotice);
router.use("/unit", deleteNotice);
router.use("/unit",  addComment);


module.exports = router;
