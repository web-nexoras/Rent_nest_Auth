const unitSchema = require("../../models/unitSchema");
const { asyncHandler } = require("../../middlewares/asyncHandler");

const getAllUnits = asyncHandler(async (req, res) => {
  const units = await unitSchema
    .find()
    .populate("assignedTenant", "name email phone")
    .sort({ unitNumber: 1 });

  return res.status(200).json({
    success: true,
    count: units.length,
    units,
  });
});

module.exports = { getAllUnits };