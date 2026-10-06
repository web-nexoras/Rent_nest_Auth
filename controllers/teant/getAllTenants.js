const { asyncHandler } = require("../../middlewares/asyncHandler");
const authSchema = require("../../models/authSchema");

const VALID_STATUSES = ["pending", "approved", "rejected"];

const getAllTenants = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);

  const filter = { role: "tenant" };

  if (status) {
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }
    filter.approvalStatus = status;
  }

  const [tenants, total] = await Promise.all([
    authSchema
      .find(filter)
      .select("name email phone approvalStatus isActive assignedUnit createdAt")
      .populate("assignedUnit", "unitNumber floor")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    authSchema.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    tenants,
  });
});

module.exports = { getAllTenants };