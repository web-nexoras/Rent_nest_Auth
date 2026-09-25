const noticeShcema = require("../../models/noticeShcema");
const { asyncHandler } = require("../../middlewares/asyncHandler");

// -------- Get All Notices Controller
const getAllNotices = asyncHandler(async (req, res) => {
  const notices = await noticeShcema
    .find()
    .populate("createdBy", "name email role")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    count: notices.length,
    notices,
  });
});

module.exports = {
  getAllNotices,
};
