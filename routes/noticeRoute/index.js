const express = require("express");
const router = express.Router();

const getallNotice = require ('./getallNotice.js')
const getNotice = require ('./getSingleNotice.js')
const createNotice = require ('./createNotice.js')
const updateNotice  = require ('./updateNotice.js')
const deleteNotice  = require ('./deleteNotice.js')
const addComment  = require ('./addComment.js')
const deleteComment = require ('./deleteComment.js')

// ---------middleware 
const { authMiddleware } = require("../../middlewares/authMiddleware.js");
// const { roleCheckMiddleware } = require("../../middlewares/roleCheckMiddleware.js");


router.use("/notice", authMiddleware);
router.use("/notice", getallNotice);
router.use("/notice", getNotice);
router.use("/notice", createNotice);
router.use("/notice", updateNotice);
router.use("/notice", deleteNotice);
router.use("/notice",  addComment);
router.use("/notice",  deleteComment);


module.exports = router;
