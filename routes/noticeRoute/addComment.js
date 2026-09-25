const express = require("express");
const router = express.Router();

const { addComment } = require("../../controllers/notice/addComment");

router.get('/comment-add',  addComment )

module.exports = router
