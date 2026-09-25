const noticeSchema = require("../../models/noticeSchema");
const { asyncHandler } = require("../../middlewares/asyncHandler");

// -------- Delete Notice Controller
const deleteNotice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notice = await noticeSchema.findById(id);

  if (!notice) {
    return res.status(404).json({
      success: false,
      message: "Notice not found",
    });
  }

  if (notice.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "You are not allowed to delete this notice",
    });
  }

  await notice.deleteOne();

  return res.status(200).json({
    success: true,
    message: "Notice deleted successfully",
  });
});

module.exports = {
  deleteNotice
};      