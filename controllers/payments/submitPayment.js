const { asyncHandler } = require("../../middlewares/asyncHandler");
const paymentSchema = require("../../models/paymentSchema");
const authSchema = require("../../models/authSchema");
const { isValidMonth } = require("../../helpers/month");


const VALID_METHODS = [
  "bKash",
  "Nagad",
  "Rocket",
  "Upay",
  "Bank",
  "Cash",
];

const submitPayment = asyncHandler(async (req, res) => {
  const { amount, month, transactionId, paymentMethod } = req.body;

  if (req.user.role !== "tenant") {
    return res.status(403).json({
      success: false,
      message: "Only tenants can submit rent payments",
    });
  }

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
  if (!month || !isValidMonth(month)) {
    return res.status(400).json({
      success: false,
      message: "Month is required in YYYY-MM format",
    });
  }

  if (!paymentMethod || !VALID_METHODS.includes(paymentMethod)) {
    return res.status(400).json({
      success: false,
      message: `Payment method must be one of: ${VALID_METHODS.join(", ")}`,
    });
  }

  let cleanTransactionId =
    typeof transactionId === "string" ? transactionId.trim() : "";

  if (!cleanTransactionId && paymentMethod === "Cash") {
    cleanTransactionId = `CASH-${Date.now()}`;
  }

  if (!cleanTransactionId) {
    return res.status(400).json({
      success: false,
      message: "Transaction ID is required",
    });
  }

  // Check duplicate payment
  const existingPayment = await paymentSchema.findOne({
    tenant: tenant._id,
    unit: tenant.assignedUnit,
    month,
  });


  if (existingPayment && existingPayment.status === "rejected") {
    existingPayment.amount = parsedAmount;
    existingPayment.transactionId = cleanTransactionId;
    existingPayment.paymentMethod = paymentMethod;
    existingPayment.status = "pending";
    existingPayment.verifiedBy = null;
    existingPayment.verifiedAt = null;
    existingPayment.paidAt = new Date();
    await existingPayment.save();

    return res.status(200).json({
      success: true,
      message: "Rejected payment resubmitted. Awaiting admin verification.",
      payment: existingPayment,
    });
  }

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
    transactionId: cleanTransactionId,
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