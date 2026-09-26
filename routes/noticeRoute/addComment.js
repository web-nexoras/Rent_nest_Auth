const express = require("express");
const router = express.Router();

const { addComment } = require("../../controllers/notice/addComment");
const { requireApproved } = require("../../middlewares/requireApproved");

router.post('/comment-add/:id', requireApproved,  addComment )

module.exports = router
