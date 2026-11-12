const { asyncHandler } = require("../../middlewares/asyncHandler");
const paymentSchema = require("../../models/paymentSchema");
const authSchema = require("../../models/authSchema");
const { getCurrentMonth } = require("../../helpers/month");

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

  const tenant = await authSchema
    .findById(req.user._id)
    .populate("assignedUnit", "assignedMonth");

  if (tenant?.assignedUnit) {
    filter.unit = tenant.assignedUnit._id;
    filter.month = {
      $gte: tenant.assignedUnit.assignedMonth || getCurrentMonth(),
    };
  }

  const payments = await paymentSchema
    .find(filter)
    .populate("unit", "unitNumber floor rentAmount assignedMonth")
    .sort({ month: -1 });

  return res.status(200).json({
    success: true,
    count: payments.length,
    payments,
  });
});

module.exports = { getMyPayments };