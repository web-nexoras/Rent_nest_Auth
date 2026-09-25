const express = require("express");
const router = express.Router();

const { getAllNotices } = require("../../controllers/notice/getAllNotices");

router.get('/getall-notice',  getAllNotices )

module.exports = router
