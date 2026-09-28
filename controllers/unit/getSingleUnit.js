const unitSchema = require("../../models/unitSchema");
const { asyncHandler } = require("../../middlewares/asyncHandler");

const getSingleUnit = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const unit = await unitSchema
    .findById(id)
    .populate("assignedTenant", "name email phone profileImage");

  if (!unit) {
    return res.status(404).json({
      success: false,
      message: "Unit not found",
    });
  }

  return res.status(200).json({
    success: true,
    unit,
  });
});

module.exports = { getSingleUnit };
