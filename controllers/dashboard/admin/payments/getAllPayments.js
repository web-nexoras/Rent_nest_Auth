const { asyncHandler } = require("../../../../middlewares/asyncHandler");
const paymentSchema = require("../../../../models/paymentSchema");
const { parsePagination } = require("../../../../helpers/pagination");
const { isValidMonth } = require("../../../../helpers/month");

const getAllPayments = asyncHandler(async (req, res) => {
  const { status, month } = req.query;
  const { page, limit, skip } = parsePagination(req.query);

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

  if (month) {
    if (!isValidMonth(month)) {
      return res.status(400).json({
        success: false,
        message: "Month must be in YYYY-MM format",
      });
    }
    filter.month = month;
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