const unitSchema = require("../../models/unitSchema");
const mongoose = require("mongoose");

const { asyncHandler } = require("../../middlewares/asyncHandler");

const {
  uploadCloudinary,
  destroyFromCloudinary,
} = require("../../helpers/cloudinary/cloudinaryUtils");

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
    if (
      typeof unitNumber !== "string" ||
      !unitNumber.trim()
    ) {
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
    unit.sizeSqft = sizeSqft;
  }

  // ---------- Bedrooms

  if (bedrooms !== undefined) {
    unit.bedrooms = bedrooms;
  }

  // ---------- Rent

  if (rentAmount !== undefined) {
    unit.rentAmount = rentAmount;
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