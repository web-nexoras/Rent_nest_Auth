const { asyncHandler } = require("../../middlewares/asyncHandler");
const paymentSchema = require("../../models/paymentSchema");
const authSchema = require("../../models/authSchema");


const VALID_METHODS = [
  "bKash",
  "Nagad",
  "Rocket",
  "Upay",
  "Bank",
  "Cash",
];

const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

const submitPayment = asyncHandler(async (req, res) => {
  const { amount, month, transactionId, paymentMethod } = req.body;

  // Get current tenant from database
  const tenant = await authSchema.findById(req.user._id);

  if (!tenant) {
    return res.status(404).json({
      success: false,
      message: "Tenant not found",
    });
  }

  // Tenant must have an assigned unit
  if (!tenant.assignedUnit) {
    return res.status(400).json({
      success: false,
      message: "You don't have an assigned unit yet",
    });
  }

  // Validate amount
  const parsedAmount = Number(amount);

  if (
    amount === undefined ||
    amount === null ||
    amount === "" ||
    isNaN(parsedAmount) ||
    parsedAmount <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "A valid payment amount is required",
    });
  }

  // Validate month
  if (!month || !MONTH_REGEX.test(month)) {
    return res.status(400).json({
      success: false,
      message: "Month is required in YYYY-MM format",
    });
  }

  // Validate transaction ID
  if (!transactionId || !transactionId.trim()) {
    return res.status(400).json({
      success: false,
      message: "Transaction ID is required",
    });
  }

  // Validate payment method
  if (!paymentMethod || !VALID_METHODS.includes(paymentMethod)) {
    return res.status(400).json({
      success: false,
      message: `Payment method must be one of: ${VALID_METHODS.join(", ")}`,
    });
  }

  // Check duplicate payment
  const existingPayment = await paymentSchema.findOne({
    tenant: tenant._id,
    unit: tenant.assignedUnit,
    month,
  });


  if (existingPayment) {
    return res.status(409).json({
      success: false,
      message: `A payment for ${month} has already been submitted`,
    });
  }

  // Create payment
  const payment = await paymentSchema.create({
    tenant: tenant._id,
    unit: tenant.assignedUnit,
    amount: parsedAmount,
    month,
    transactionId: transactionId.trim(),
    paymentMethod,
  });

  return res.status(201).json({
    success: true,
    message: "Payment submitted successfully. Awaiting admin verification.",
    payment,
  });
});

module.exports = {
  submitPayment,
};