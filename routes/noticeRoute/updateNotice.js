const express = require("express");
const router = express.Router();


const { updateNotice } = require("../../controllers/notice/updateNotice");

router.put('/update-notice/:id', updateNotice)

module.exports = router
