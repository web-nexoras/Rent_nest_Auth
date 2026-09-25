const noticeSchema = require("../../models/noticeSchema");
const { asyncHandler } = require("../../middlewares/asyncHandler");

// -------- Update Notice Controller
const updateNotice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

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
      message: "You are not allowed to update this notice",
    });
  }

  if (title !== undefined) {
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title cannot be empty",
      });
    }

    notice.title = title;
  }

  if (description !== undefined) {
    if (!description) {
      return res.status(400).json({
        success: false,
        message: "Description cannot be empty",
      });
    }

    notice.description = description;
  }

  await notice.save();

  return res.status(200).json({
    success: true,
    message: "Notice updated successfully",
    notice,
  });
});

module.exports = {
  updateNotice
};