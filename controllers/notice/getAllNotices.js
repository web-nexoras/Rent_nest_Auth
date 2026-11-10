const noticeSchema = require("../../models/noticeSchema");
const { asyncHandler } = require("../../middlewares/asyncHandler");
const { parsePagination } = require("../../helpers/pagination");

const getAllNotices = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = {};

  if (typeof req.query.search === "string" && req.query.search.trim()) {
    const term = req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { title: { $regex: term, $options: "i" } },
      { description: { $regex: term, $options: "i" } },
    ];
  }

  const total = await noticeSchema.countDocuments(filter);

  const notices = await noticeSchema
    .find(filter)
    .populate("createdBy", "name email role")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return res.status(200).json({
    success: true,
    count: notices.length,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 0,
    notices,
  });
});

module.exports = {
  getAllNotices,
};
