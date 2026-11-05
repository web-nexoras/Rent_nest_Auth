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
    filter.$or = [
      { name: { $regex: term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
      { email: { $regex: term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
      { phone: { $regex: term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
    ];
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
  getAllTenants
};