const unitSchema = require("../../models/unitSchema");
const { asyncHandler } = require("../../middlewares/asyncHandler");

const getAllUnits = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await unitSchema.countDocuments();

  const units = await unitSchema
    .find()
    .populate("assignedTenant", "name email phone")
    .sort({ unitNumber: 1 })
    .skip(skip)
    .limit(limit);

  return res.status(200).json({
    success: true,
    count: units.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    units,
  });
});

module.exports = { getAllUnits };