const express = require("express");
const router = express.Router();


const { updateNotice } = require("../../controllers/notice/updateNotice");

router.get('/create-notice', updateNotice)

module.exports = router
