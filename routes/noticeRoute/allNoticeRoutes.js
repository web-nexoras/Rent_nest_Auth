const express = require("express");
const router = express.Router();

// ----------controllerss 
const { createNotice } = require("../../controllers/notice/createNotice");
const { getAllNotices } = require("../../controllers/notice/getAllNotices");
const { getNotice } = require("../../controllers/notice/singleNotice");
const { deleteNotice } = require("../../controllers/notice/deleteNotice");
const { updateNotice } = require("../../controllers/notice/updateNotice");
const { addComment } = require("../../controllers/notice/addComment");
const { deleteComment } = require("../../controllers/notice/deleteComment");

// ----------middleweres
const { adminOnly } = require("../../middlewares/adminOnly");
const { requireApproved } = require("../../middlewares/requireApproved");

router.post("/create-notice", adminOnly, createNotice);
router.get("/getall-notice", getAllNotices);
router.get("/single-notice/:id", getNotice);
router.delete("/del-notice/:id", adminOnly, deleteNotice);
router.patch("/update-notice/:id", adminOnly, updateNotice);
router.post("/comment-add/:id", requireApproved, addComment);
router.delete("/del-comment/:id/:commentId", deleteComment);

module.exports = router;
