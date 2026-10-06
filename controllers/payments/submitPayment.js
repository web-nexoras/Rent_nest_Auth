const paymentSchema = require("../../models/paymentSchema");
const { asyncHandler } = require("../../middlewares/asyncHandler");

const VALID_METHODS = ["bKash", "Nagad", "Rocket", "Upay", "Bank", "Cash"];

const submitPayment = asyncHandler(async (req, res) => {
  const { amount, month, transactionId, paymentMethod } = req.body;

  if (!req.user.assignedUnit) {
    return res.status(400).json({
      success: false,
      message: "You don't have an assigned unit yet",
    });
  }

  const parsedAmount = Number(amount);

  if (amount === undefined || amount === null || amount === "" || parsedAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: "A valid payment amount is required",
    });
  }

  if (!month || !MONTH_REGEX.test(month)) {
    return res.status(400).json({
      success: false,
      message: "Month is required in YYYY-MM format",
    });
  }

  if (!transactionId || !transactionId.trim()) {
    return res.status(400).json({
      success: false,
      message: "Transaction ID is required",
    });
  }

  if (!paymentMethod || !VALID_METHODS.includes(paymentMethod)) {
    return res.status(400).json({
      success: false,
      message: `Payment method must be one of: ${VALID_METHODS.join(", ")}`,
    });
  }

  // One payment per tenant per unit per month (also enforced by a unique index in the schema)
  const existing = await paymentSchema.findOne({
    tenant: req.user._id,
    unit: req.user.assignedUnit,
    month,
  });

  if (existing) {
    return res.status(409).json({
      success: false,
      message: `A payment for ${month} has already been submitted`,
    });
  }

  const payment = await paymentSchema.create({
    tenant: req.user._id,
    unit: req.user.assignedUnit,
    amount: parsedAmount,
    month,
    transactionId: transactionId.trim(),
    paymentMethod,
    paidAt: new Date(),
  });

  return res.status(201).json({
    success: true,
    message: "Payment submitted successfully. Awaiting admin verification.",
    payment,
  });
});

module.exports = { submitPayment };