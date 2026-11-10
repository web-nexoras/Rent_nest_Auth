const { asyncHandler } = require("../../middlewares/asyncHandler");
const authSchema = require("../../models/authSchema");
const { parsePagination } = require("../../helpers/pagination");

const getAllTenants = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const { page, limit, skip } = parsePagination(req.query);

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

  if (typeof search === "string" && search.trim()) {
    const term = search.trim();
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { name: { $regex: escaped, $options: "i" } },
      { email: { $regex: escaped, $options: "i" } },
      { phone: { $regex: escaped, $options: "i" } },
      { nidNumber: { $regex: escaped, $options: "i" } },
    ];
  }

  const tenants = await authSchema
    .find(filter)
    .select(
      "name email phone approvalStatus isActive isVerified assignedUnit nidNumber occupation presentAddress permanentAddress profileImage createdAt",
    )
    .populate("assignedUnit", "unitNumber floor rentAmount sizeSqft bedrooms")
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
