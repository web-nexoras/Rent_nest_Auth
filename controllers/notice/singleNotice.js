const noticeSchema = require("../../models/noticeShcema");
const { asyncHandler } = require("../../middlewares/asyncHandler");

// -------- Get Single Notice Controller
const getNotice = asyncHandler(async (req, res) => {
  const { id } = req.params;

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
