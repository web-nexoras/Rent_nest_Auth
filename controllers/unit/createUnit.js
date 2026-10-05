const unitSchema = require("../../models/unitSchema");

const { asyncHandler } = require("../../middlewares/asyncHandler");

const { uploadCloudinary } = require("../../helpers/cloudinary/cloudinaryUtils");

// -------- Create Unit Controller

const createUnit = asyncHandler(async (req, res) => {
  const {
    unitNumber,
    floor,
    sizeSqft,
    bedrooms,
    rentAmount,
    description,
  } = req.body;

  const images = req.files;

  // ---------- Validation
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

  // ---------- Check Duplicate Unit

  const existingUnit = await unitSchema.findOne({
    unitNumber: unitNumber.trim(),
  });

  if (existingUnit) {
    return res.status(409).json({
      success: false,
      message: "Unit number already exists",
    });
  }

  // ---------- Upload Images
  const imageUrls = [];

  if (images?.length) {
    for (const image of images) {
      const imageUrl = await uploadCloudinary({
        mimetype: image.mimetype,
        imgBuffer: image.buffer,
      });

      imageUrls.push(imageUrl);
    }
  }

  // ---------- Create Unit
  const unit = await unitSchema.create({
    unitNumber,
    floor,
    sizeSqft,
    bedrooms,
    rentAmount,
    description,
    images: imageUrls,
  });

  return res.status(201).json({
    success: true,
    message: "Unit created successfully",
    unit,
  });
});

module.exports = {
  createUnit,
};