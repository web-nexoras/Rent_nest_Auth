const express = require("express");
const router = express.Router();

const { deleteNotice } = require("../../controllers/notice/deleteNotice");

router.post('/del-notice/:id',  deleteNotice  )

module.exports = router
