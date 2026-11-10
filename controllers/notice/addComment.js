const { asyncHandler } = require("../../middlewares/asyncHandler");
const noticeSchema = require("../../models/noticeSchema");
const mongoose = require("mongoose");

const addComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { text } = req.body || {};

  if (typeof text !== "string" || !text.trim()) {
    return res.status(400).json({
      success: false,
      message: "Comment text is required",
    });
  }

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid notice ID",
    });
  }

  const notice = await noticeSchema.findById(id);

  if (!notice) {
    return res.status(404).json({
      success: false,
      message: "Notice not found",
    });
  }

  notice.comments.push({
    tenant: req.user._id,
    text: text.trim(),
  });

  await notice.save();

  return res.status(201).json({
    success: true,
    message: "Comment added successfully",
    notice,
  });
});

module.exports = {
  addComment,
};
