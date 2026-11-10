const { asyncHandler } = require("../../middlewares/asyncHandler");
const paymentSchema = require("../../models/paymentSchema");
const authSchema = require("../../models/authSchema");
const unitSchema = require("../../models/unitSchema");
const { isValidMonth } = require("../../helpers/month");
const { invalidateCache } = require("../../middlewares/redisCache");

const VALID_METHODS = [
  "SSLCommerz",
  "bKash",
  "Nagad",
  "Rocket",
  "Upay",
  "Bank",
  "Cash",
];

// Submit manual rent payment locked to the assigned unit's fixed rentAmount
const submitPayment = asyncHandler(async (req, res) => {
  const { month, transactionId, paymentMethod } = req.body;

  if (req.user.role !== "tenant") {
    return res.status(403).json({
      success: false,
      message: "Only tenants can submit rent payments",
    });
  }

  const tenant = await authSchema.findById(req.user._id);

  if (!tenant) {
    return res.status(404).json({
      success: false,
      message: "Tenant not found",
    });
  }

  if (!tenant.assignedUnit) {
    return res.status(400).json({
      success: false,
      message: "You don't have an assigned unit yet",
    });
  }

  const unit = await unitSchema.findById(tenant.assignedUnit);
  if (!unit) {
    return res.status(404).json({
      success: false,
      message: "Assigned unit not found",
    });
  }

  // Enforce fixed unit rent amount (ignore any client-supplied amount)
  const fixedAmount = Number(unit.rentAmount);
  if (!Number.isFinite(fixedAmount) || fixedAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Unit rent amount is not configured properly",
    });
  }

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

  const existingPayment = await paymentSchema.findOne({
    tenant: tenant._id,
    unit: unit._id,
    month,
  });

  // Allow resubmission if previous payment for this month was rejected
  if (existingPayment && existingPayment.status === "rejected") {
    existingPayment.amount = fixedAmount;
    existingPayment.transactionId = cleanTransactionId;
    existingPayment.paymentMethod = paymentMethod;
    existingPayment.status = "pending";
    existingPayment.verifiedBy = null;
    existingPayment.verifiedAt = null;
    existingPayment.paidAt = new Date();
    await existingPayment.save();

    await invalidateCache("admin", "units", "payments", "tenant");

    return res.status(200).json({
      success: true,
      message: "Rejected payment resubmitted with fixed unit rent. Awaiting admin verification.",
      payment: existingPayment,
    });
  }

  if (existingPayment) {
    return res.status(409).json({
      success: false,
      message: `A payment for ${month} has already been submitted`,
    });
  }

  const payment = await paymentSchema.create({
    tenant: tenant._id,
    unit: unit._id,
    amount: fixedAmount,
    month,
    transactionId: cleanTransactionId,
    paymentMethod,
  });

  await invalidateCache("admin", "units", "payments", "tenant");

  return res.status(201).json({
    success: true,
    message: `Payment of ${fixedAmount} BDT submitted successfully. Awaiting admin verification.`,
    payment,
  });
});

module.exports = {
  submitPayment,
};
