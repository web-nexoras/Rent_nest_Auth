const unitSchema = require("../../models/unitSchema");

const { asyncHandler } = require("../../middlewares/asyncHandler");

const { uploadCloudinary } = require("../../helpers/cloudinary/cloudinaryUtils");
const { parseNumber } = require("../../helpers/numbers");

// -------- Create Unit Controller

const createUnit = asyncHandler(async (req, res) => {
  const {
    unitNumber,
    floor,
    sizeSqft,
    bedrooms,
    rentAmount,
    rentDueDay,
    description,
  } = req.body;

  const images = req.files;

  // ---------- Validation
  const cleanUnitNumber = typeof unitNumber === "string" ? unitNumber.trim() : "";

  if (!cleanUnitNumber) {
    return res.status(400).json({
      success: false,
      message: "Unit number is required",
    });
  }

  const rent = parseNumber(rentAmount, "Rent amount", { required: true, min: 0 });
  if (rent.error) {
    return res.status(400).json({ success: false, message: rent.error });
  }

  const dueDay = parseNumber(rentDueDay, "Rent due day", { min: 1, max: 31, integer: true });
  if (dueDay.error) {
    return res.status(400).json({ success: false, message: dueDay.error });
  }

  const size = parseNumber(sizeSqft, "Size", { min: 0 });
  if (size.error) {
    return res.status(400).json({ success: false, message: size.error });
  }

  const beds = parseNumber(bedrooms, "Bedrooms", { min: 0, integer: true });
  if (beds.error) {
    return res.status(400).json({ success: false, message: beds.error });
  }

  // ---------- Check Duplicate Unit

  const existingUnit = await unitSchema.findOne({
    unitNumber: cleanUnitNumber,
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
    unitNumber: cleanUnitNumber,
    floor,
    sizeSqft: size.value,
    bedrooms: beds.value,
    rentAmount: rent.value,
    rentDueDay: dueDay.value ?? 1,
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
