const express = require("express");
const router = express.Router();

const { createNotice } = require("../../controllers/notice/createNotice");
const { adminOnly } = require("../../middlewares/adminOnly");

router.post('/create-notice', adminOnly,  createNotice )

module.exports = router
 