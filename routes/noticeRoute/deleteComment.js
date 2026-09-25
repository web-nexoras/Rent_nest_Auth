const express = require("express");
const router = express.Router();

const { deleteComment } = require("../../controllers/notice/deleteComment");

router.delete("/del-comment/:id/:commentId", deleteComment);

module.exports = router;
