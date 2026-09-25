const noticeSchema = require("../../models/noticeSchema");
const { asyncHandler } = require("../../middlewares/asyncHandler");

// -------- Create Notice Controller
const createNotice = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({
      success: false,
      message: "Title is required",
    });
  }

  if (!description) {
    return res.status(400).json({
      success: false,
      message: "Description is required",
    });
  }

  const notice = await noticeSchema.create({
    title,
    description,
    createdBy: req.user._id,
  });

  return res.status(201).json({
    success: true,
    message: "Notice created successfully",
    notice,
  });
});

module.exports = {
  createNotice,
};