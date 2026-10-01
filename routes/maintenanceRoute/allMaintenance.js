const express = require("express");
const router = express.Router();

// ----------controllerss


// ----------middleweres
const { adminOnly } = require("../../middlewares/adminOnly");
const { requireApproved } = require("../../middlewares/requireApproved");

router.post("/create", adminOnly, createNotice);
// router.get("/getall", getAllNotices);
// router.get("/single/:id", getNotice);
// router.delete("/del/:id", adminOnly, deleteNotice);
// router.patch("/update/:id", adminOnly, updateNotice);
// router.post("/comment/:id", requireApproved, addComment);
// router.delete("/del-comment/:id/:commentId", deleteComment);

module.exports = router;
