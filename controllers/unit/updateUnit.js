const unitSchema = require("../../models/unitSchema");
const { asyncHandler } = require("../../middlewares/asyncHandler");

const updateUnit = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const {
    unitNumber,
    floor,
    sizeSqft,
    bedrooms,
    rentAmount,
    description,
    images,
  } = req.body;

  const unit = await unitSchema.findById(id);

  if (!unit) {
    return res.status(404).json({
      success: false,
      message: "Unit not found",
    });
  }

  if (unitNumber !== undefined) {
    if (!unitNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: "Unit number cannot be empty",
      });
    }

    const existingUnit = await unitSchema.findOne({
      unitNumber: unitNumber.trim(),
      _id: { $ne: id },
    });

    if (existingUnit) {
      return res.status(409).json({
        success: false,
        message: "Unit number already exists",
      });
    }

    unit.unitNumber = unitNumber.trim();
  }

  if (floor !== undefined) {
    unit.floor = floor;
  }

  if (sizeSqft !== undefined) {
    unit.sizeSqft = sizeSqft;
  }

  if (bedrooms !== undefined) {
    unit.bedrooms = bedrooms;
  }

  if (rentAmount !== undefined) {
    unit.rentAmount = rentAmount;
  }

  if (description !== undefined) {
    unit.description = description;
  }

  if (images !== undefined) {
    unit.images = images;
  }

  await unit.save();

  return res.status(200).json({
    success: true,
    message: "Unit updated successfully",
    unit,
  });
});

module.exports = { updateUnit };
