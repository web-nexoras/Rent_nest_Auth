const express = require("express");
const router = express.Router();


const { updateNotice } = require("../../controllers/notice/updateNotice");

router.patch('/update-notice/:id', updateNotice)

module.exports = router
