const express = require("express");
const router = express.Router();

const { getNotice } = require("../../controllers/notice/singleNotice");

router.get('/single-notice',  getNotice )

module.exports = router
