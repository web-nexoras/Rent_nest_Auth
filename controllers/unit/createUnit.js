const unitSchema = require("../../models/unitSchema");
const { asyncHandler } = require("../../middlewares/asyncHandler");

const createUnit = asyncHandler(async (req, res) => {
  const {
    unitNumber,
    floor,
    sizeSqft,
    bedrooms,
    rentAmount,
    description,
    images,
  } = req.body;

  if (!unitNumber || !unitNumber.trim()) {
    return res.status(400).json({
      success: false,
      message: "Unit number is required",
    });
  }

  if (rentAmount === undefined || rentAmount === null) {
    return res.status(400).json({
      success: false,
      message: "Rent amount is required",
    });
  }

  const existingUnit = await unitSchema.findOne({
    unitNumber: unitNumber.trim(),
  });

  if (existingUnit) {
    return res.status(409).json({
      success: false,
      message: "Unit number already exists",
    });
  }

  const unit = await unitSchema.create({
    unitNumber: unitNumber.trim(),
    floor,
    sizeSqft,
    bedrooms,
    rentAmount,
    description,
    images,
  });

  return res.status(201).json({
    success: true,
    message: "Unit created successfully",
    unit,
  });
});

module.exports = createUnit;