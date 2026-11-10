const express = require("express");
const router = express.Router();

const { createNotice } = require("../../controllers/notice/createNotice");
const { getAllNotices } = require("../../controllers/notice/getAllNotices");
const { getNotice } = require("../../controllers/notice/singleNotice");
const { deleteNotice } = require("../../controllers/notice/deleteNotice");
const { updateNotice } = require("../../controllers/notice/updateNotice");
const { addComment } = require("../../controllers/notice/addComment");
const { deleteComment } = require("../../controllers/notice/deleteComment");

const { adminOnly } = require("../../middlewares/adminOnly");
const { requireApproved } = require("../../middlewares/requireApproved");
const { cacheGet, clearCacheOnSuccess } = require("../../middlewares/redisCache");

const clearNoticeCache = clearCacheOnSuccess("notices", "tenant", "admin");

router.post("/create", adminOnly, clearNoticeCache, createNotice);
router.get("/getall", cacheGet("notices", 25), getAllNotices);
router.get("/single/:id", cacheGet("notices", 25), getNotice);
router.delete("/del/:id", adminOnly, clearNoticeCache, deleteNotice);
router.patch("/update/:id", adminOnly, clearNoticeCache, updateNotice);
router.post("/comment/:id", requireApproved, clearNoticeCache, addComment);
router.delete("/del-comment/:id/:commentId", requireApproved, clearNoticeCache, deleteComment);

module.exports = router;
