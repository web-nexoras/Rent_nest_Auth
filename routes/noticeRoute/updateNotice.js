const express = require("express");
const router = express.Router();


const { updateNotice } = require("../../controllers/notice/updateNotice");
const { adminOnly } = require("../../middlewares/adminOnly");

router.patch('/update-notice/:id',adminOnly  ,updateNotice)

module.exports = router
