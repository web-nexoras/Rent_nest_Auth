
const { asyncHandler } = require("../../middlewares/asyncHandler");
const unitSchema = require("../../models/unitSchema");

const isNonNegativeNumber = (value) =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

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

  if (!unitNumber || typeof unitNumber !== "string" || !unitNumber.trim()) {
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

  if (!isNonNegativeNumber(rentAmount) || rentAmount === 0) {
    return res.status(400).json({
      success: false,
      message: "Rent amount must be a number greater than 0",
    });
  }

  if (sizeSqft !== undefined && !isNonNegativeNumber(sizeSqft)) {
    return res.status(400).json({
      success: false,
      message: "Size must be a non-negative number",
    });
  }

  if (bedrooms !== undefined && !isNonNegativeNumber(bedrooms)) {
    return res.status(400).json({
      success: false,
      message: "Bedrooms must be a non-negative number",
    });
  }

  if (
    images !== undefined &&
    (!Array.isArray(images) || !images.every((img) => typeof img === "string"))
  ) {
    return res.status(400).json({
      success: false,
      message: "Images must be an array of URLs",
    });
  }

  // Normalize so "a-203" and "A-203" can't both exist
  const normalizedUnitNumber = unitNumber.trim().toUpperCase();

  const existingUnit = await unitSchema.findOne({
    unitNumber: normalizedUnitNumber,
  });

  if (existingUnit) {
    return res.status(409).json({
      success: false,
      message: "Unit number already exists",
    });
  }

  // status & assignedTenant are intentionally NOT accepted from the client
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