const { asyncHandler } = require("../../middlewares/asyncHandler");
const unitSchema = require("../../models/unitSchema");

const deleteUnit = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const unit = await unitSchema.findById(id);

  if (!unit) {
    return res.status(404).json({
      success: false,
      message: "Unit not found",
    });
  }

  if (unit.assignedTenant) {
    return res.status(400).json({
      success: false,
      message: "Cannot delete an occupied unit",
    });
  }

  await unit.deleteOne();

  return res.status(200).json({
    success: true,
    message: "Unit deleted successfully",
  });
});

module.exports = deleteUnit;