const unitSchema = require("../../../../models/unitSchema");
const { asyncHandler } = require("../../../../middlewares/asyncHandler");
const { parsePagination } = require("../../../../helpers/pagination");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getAllUnits = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { status, search } = req.query;
  const filter = {};

  if (status) {
    if (!["vacant", "occupied"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be vacant or occupied",
      });
    }
    filter.status = status;
  }

  if (typeof search === "string" && search.trim()) {
    filter.unitNumber = { $regex: escapeRegex(search.trim()), $options: "i" };
  }

  const total = await unitSchema.countDocuments(filter);

  const units = await unitSchema
    .find(filter)
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