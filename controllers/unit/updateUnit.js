const unitSchema = require("../../models/unitSchema");
const mongoose = require("mongoose");

const { asyncHandler } = require("../../middlewares/asyncHandler");

const {
  uploadCloudinary,
  destroyFromCloudinary,
} = require("../../helpers/cloudinary/cloudinaryUtils");
const { parseNumber } = require("../../helpers/numbers");

// -------- Update Unit Controller

const updateUnit = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // ---------- Validate Unit ID

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid unit ID",
    });
  }

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

  // ---------- Find Unit

  const unit = await unitSchema.findById(id);

  if (!unit) {
    return res.status(404).json({
      success: false,
      message: "Unit not found",
    });
  }

  // ---------- Unit Number

  if (unitNumber !== undefined) {
    if (typeof unitNumber !== "string" || !unitNumber.trim()) {
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

  // ---------- Floor

  if (floor !== undefined) {
    unit.floor = floor;
  }

  // ---------- Size

  if (sizeSqft !== undefined) {
    const size = parseNumber(sizeSqft, "Size", { min: 0 });
    if (size.error) {
      return res.status(400).json({ success: false, message: size.error });
    }
    unit.sizeSqft = size.value;
  }

  // ---------- Bedrooms

  if (bedrooms !== undefined) {
    const beds = parseNumber(bedrooms, "Bedrooms", { min: 0, integer: true });
    if (beds.error) {
      return res.status(400).json({ success: false, message: beds.error });
    }
    unit.bedrooms = beds.value;
  }

  // ---------- Rent

  if (rentAmount !== undefined) {
    const rent = parseNumber(rentAmount, "Rent amount", {
      required: true,
      min: 0,
    });
    if (rent.error) {
      return res.status(400).json({ success: false, message: rent.error });
    }
    unit.rentAmount = rent.value;
  }

  if (rentDueDay !== undefined) {
    const dueDay = parseNumber(rentDueDay, "Rent due day", {
      min: 1,
      max: 31,
      integer: true,
    });
    if (dueDay.error) {
      return res.status(400).json({ success: false, message: dueDay.error });
    }
    unit.rentDueDay = dueDay.value;
  }

  // ---------- Description

  if (description !== undefined) {
    unit.description = description;
  }

  // ---------- Update Images

  if (images?.length) {
    const newImageUrls = [];

    for (const image of images) {
      const imageUrl = await uploadCloudinary({
        mimetype: image.mimetype,
        imgBuffer: image.buffer,
      });

      newImageUrls.push(imageUrl);
    }

    // Delete old images from Cloudinary

    if (unit.images?.length) {
      for (const oldImage of unit.images) {
        try {
          await destroyFromCloudinary(oldImage);
        } catch (error) {
          console.error("Old unit image delete error:", error);
        }
      }
    }

    // Replace old images with new images

    unit.images = newImageUrls;
  }

  // ---------- Save

  await unit.save();

  return res.status(200).json({
    success: true,
    message: "Unit updated successfully",
    unit,
  });
});

module.exports = {
  updateUnit,
};
