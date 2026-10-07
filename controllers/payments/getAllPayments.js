const { asyncHandler } = require("../../middlewares/asyncHandler");
const paymentSchema = require("../../models/paymentSchema");

const getAllPayments = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  const filter = {};

  // Filter by payment status
  if (status) {
    if (!["pending", "verified", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    filter.status = status;
  }

  const payments = await paymentSchema
    .find(filter)
    .populate("tenant", "name email phone")
    .populate("unit", "unitNumber floor")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await paymentSchema.countDocuments(filter);

  return res.status(200).json({
    success: true,
    total,
    page,
    limit,
    payments,
  });
});

module.exports = {
  getAllPayments
};