const mongoose = require("mongoose");
const unitSchema = require("../../models/unitSchema");
const { asyncHandler } = require("../../middlewares/asyncHandler");
const { destroyFromCloudinary } = require("../../helpers/cloudinary/cloudinaryUtils");

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

  if (unit.images?.length) {
    for (const image of unit.images) {
      try {
        await destroyFromCloudinary(image);
      } catch (error) {
        console.error("Unit image delete error:", error);
      }
    }
  }

  await unit.deleteOne();

  return res.status(200).json({
    success: true,
    message: "Unit deleted successfully",
  });
});

module.exports = { deleteUnit };