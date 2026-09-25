const express = require("express");
const router = express.Router();

const { getNotice } = require("../../controllers/notice/singleNotice");

router.get('/single-notice/:id', getNotice);

module.exports = router
