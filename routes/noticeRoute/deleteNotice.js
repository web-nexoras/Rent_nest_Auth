const express = require("express");
const router = express.Router();

const { deleteNotice } = require("../../controllers/notice/deleteNotice");
const { adminOnly } = require("../../middlewares/adminOnly");

router.delete("/del-notice/:id", adminOnly, deleteNotice);

module.exports = router;
