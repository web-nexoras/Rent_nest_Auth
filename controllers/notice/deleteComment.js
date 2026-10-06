const mongoose = require("mongoose");
const { asyncHandler } = require("../../middlewares/asyncHandler");
const noticeSchema = require("../../models/noticeShcema");

// Permission: admin can delete any comment, tenant can delete only their own
const deleteComment = asyncHandler(async (req, res) => {
  const { id, commentId } = req.params;

  if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(commentId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid notice or comment ID",
    });
  }

  const notice = await noticeSchema.findById(id);

  if (!notice) {
    return res.status(404).json({
      success: false,
      message: "Notice not found",
    });
  }

  const comment = notice.comments.id(commentId);

  if (!comment) {
    return res.status(404).json({
      success: false,
      message: "Comment not found",
    });
  }

  const isOwner = comment.tenant.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: "You are not allowed to delete this comment",
    });
  }

  comment.deleteOne();
  await notice.save();

  return res.status(200).json({
    success: true,
    message: "Comment deleted successfully",
  });
});

module.exports = {
  deleteComment,
};
