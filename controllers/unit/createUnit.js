const { asyncHandler } = require("../../middlewares/asyncHandler");
const unitSchema = require("../../models/unitSchema");

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

  if (typeof unitNumber !== "string" || !unitNumber.trim()) {
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

  const normalizedUnitNumber = unitNumber.trim();
  const existingUnit = await unitSchema.findOne({
    unitNumber: normalizedUnitNumber,
  });

  if (existingUnit) {
    return res.status(409).json({
      success: false,
      message: "Unit number already exists",
    });
  }

  const unit = await unitSchema.create({
    unitNumber: normalizedUnitNumber,
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

module.exports = { createUnit };
