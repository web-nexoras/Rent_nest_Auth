const noticeSchema = require("../../models/noticeShcema");
const { asyncHandler } = require("../../middlewares/asyncHandler");
const mongoose = require("mongoose");

// -------- Get Single Notice Controller
const getNotice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid notice ID",
    });
  }

  const notice = await noticeSchema
    .findById(id)
    .populate("createdBy", "name email role")
    .populate("comments.tenant", "name email");

  if (!notice) {
    return res.status(404).json({
      success: false,
      message: "Notice not found",
    });
  }

  return res.status(200).json({
    success: true,
    notice,
  });
});

module.exports = {
  getNotice,
};
