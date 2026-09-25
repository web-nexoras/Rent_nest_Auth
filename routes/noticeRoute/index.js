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
const { roleCheckMiddleware } = require("../../middlewares/roleCheckMiddleware.js");


router.use("/notice", authMiddleware);
router.use("/notice", getallNotice);
router.use("/notice", getNotice);
router.use("/notice", roleCheckMiddleware("admin"), createNotice);
router.use("/notice", roleCheckMiddleware("admin"), updateNotice);
router.use("/notice", roleCheckMiddleware("admin"), deleteNotice);
router.use("/notice", roleCheckMiddleware("tenant"), addComment);
router.use("/notice", roleCheckMiddleware("tenant"), deleteComment);


module.exports = router;
