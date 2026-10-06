const { asyncHandler } = require("../../middlewares/asyncHandler");
const paymentSchema = require("../../models/paymentSchema");

const STATUS = ["pending", "verified", "rejected"];

const getAllPayments = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);

  const filter = {};

  if (status) {
    if (!STATUS.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${STATUS.join(", ")}`,
      });
    }
    filter.status = status;
  }

  const [payments, total] = await Promise.all([
    paymentSchema
      .find(filter)
      .populate("tenant", "name email phone")
      .populate("unit", "unitNumber floor")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    paymentSchema.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    payments,
  });
});

module.exports = { getAllPayments };