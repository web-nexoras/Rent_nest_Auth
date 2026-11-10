const { asyncHandler } = require("../../middlewares/asyncHandler");
const paymentSchema = require("../../models/paymentSchema");

const STATUSES = ["pending", "verified", "rejected"];

const getMyPayments = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { tenant: req.user._id };

  if (status) {
    if (!STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${STATUSES.join(", ")}`,
      });
    }
    filter.status = status;
  }

  const payments = await paymentSchema
    .find(filter)
    .populate("unit", "unitNumber floor rentAmount")
    .sort({ month: -1 });

  return res.status(200).json({
    success: true,
    count: payments.length,
    payments,
  });
});

module.exports = { getMyPayments };