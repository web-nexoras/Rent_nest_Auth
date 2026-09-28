const mongoose = require("mongoose");
const unitSchema = require("../../models/unitSchema");
const { asyncHandler } = require("../../middlewares/asyncHandler");

const deleteUnit = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid unit ID",
    });
  }

  const unit = await unitSchema.findById(id);

  if (!unit) {
    return res.status(404).json({
      success: false,
      message: "Unit not found",
    });
  }

  if (unit.assignedTenant || unit.status === "occupied") {
    return res.status(400).json({
      success: false,
      message: "Cannot delete an occupied unit. Remove the tenant first.",
    });
  }

  await unit.deleteOne();

  return res.status(200).json({
    success: true,
    message: "Unit deleted successfully",
  });
});

module.exports = { deleteUnit };