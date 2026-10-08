const { asyncHandler } = require("../../middlewares/asyncHandler");
const authSchema = require("../../models/authSchema");

const getAllTenants = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  const filter = {
    role: "tenant",
  };

    if (status) {
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid approval status",
      });
    }

    filter.approvalStatus = status;
  }

  const tenants = await authSchema
    .find(filter)
    .select("name email phone approvalStatus isActive assignedUnit createdAt")
    .populate("assignedUnit", "unitNumber floor")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await authSchema.countDocuments(filter);

  return res.status(200).json({
    success: true,
    total,
    page,
    limit,
    tenants,
  });
});

module.exports = {
  getAllTenants,
};