const express = require("express");
const router = express.Router();

const { addComment } = require("../../controllers/notice/addComment");

router.post('/comment-add/:id',  addComment )

module.exports = router
