const mongoose = require("mongoose");
const noticeSchema = require("../../models/noticeSchema");
const { asyncHandler } = require("../../middlewares/asyncHandler");

const deleteNotice = asyncHandler(async (req, res) => {
  const { id } = req.params;

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

  await notice.deleteOne();

  return res.status(200).json({
    success: true,
    message: "Notice deleted successfully",
  });
});

module.exports = {
  deleteNotice,
};