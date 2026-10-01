const maintenanceSchema = require("../../models/maintenanceSchema");
const unitSchema = require("../../models/unitSchema");

const { asyncHandler } = require("../../middlewares/asyncHandler");
const authSchema = require("../../models/authSchema");

const {
  uploadCloudinary,
} = require("../../helpers/cloudinary/cloudinaryUtils");

const createMaintenance = asyncHandler(async (req, res) => {
  const { category, description } = req.body;
  const images = req.files;

  if (!category) { 
    return res.status(400).json({
      success: false,
      message: "Category is required",
    });
  }

  if (!description || !description.trim()) {
    return res.status(400).json({
      success: false,
      message: "Description is required",
    });
  }

const tenant = await authSchema.findById(req.user._id);

  if (!tenant) {
    return res.status(404).json({
      success: false,
      message: "Tenant not found",
    });
  }

  if (tenant.role !== "tenant") {
    return res.status(403).json({
      success: false,
      message: "Only tenants can create maintenance requests",
    });
  }

  if (!tenant.assignedUnit) {
    return res.status(400).json({
      success: false,
      message: "You are not assigned to any unit",
    });
  }

  const unit = await unitSchema.findById(tenant.assignedUnit);

  if (!unit) {
    return res.status(404).json({
      success: false,
      message: "Assigned unit not found",
    });
  }

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

  const maintenanceRequest = await maintenanceSchema.create({
    tenant: tenant._id,
    unit: unit._id,
    category,
    description,
    images: imageUrls,
  });

  return res.status(201).json({
    success: true,
    message: "Maintenance request submitted successfully",
    maintenanceRequest,
  });
});

module.exports = {
  createMaintenance
};
