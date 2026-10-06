const mongoose = require("mongoose");
const noticeSchema = require("../../models/noticeShcema");
const { asyncHandler } = require("../../middlewares/asyncHandler");

const updateNotice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body || {};

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

  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title cannot be empty",
      });
    }
    notice.title = title.trim();
  }

  if (description !== undefined) {
    if (typeof description !== "string" || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Description cannot be empty",
      });
    }
    notice.description = description.trim();
  }

  await notice.save();

  return res.status(200).json({
    success: true,
    message: "Notice updated successfully",
    notice,
  });
});

module.exports = {
  updateNotice,
};
