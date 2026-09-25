const noticeSchema = require("../../models/noticeShcema");
const { asyncHandler } = require("../../middlewares/asyncHandler");

// -------- Delete Comment Controller
const deleteComment = asyncHandler(async (req, res) => {
  const { id, commentId } = req.params;

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

  if (comment.tenant.toString() !== req.user._id.toString()) {
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
