const express = require("express");
const router = express.Router();

const getallNotice = require ('./getallNotice.js')
const getNotice = require ('./getSingleNotice.js')
const createNotice = require ('./createNotice.js')
const updateNotice  = require ('./updateNotice.js')
const deleteNotice  = require ('./deleteNotice.js')
const addComment  = require ('./addComment.js')
// const logOut = require ('./logOut.js')
// const getProfile = require ('./getProfile.js')
// const updateProfile = require ('./updateProfile.js')

router.use("/notice", getallNotice );
router.use("/notice", getNotice );
router.use("/notice", createNotice );
router.use("/notice", updateNotice );
router.use("/notice", deleteNotice );
router.use("/notice", addComment );


module.exports = router;
