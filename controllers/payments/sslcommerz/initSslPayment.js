const { asyncHandler } = require("../../../middlewares/asyncHandler");
const paymentSchema = require("../../../models/paymentSchema");
const authSchema = require("../../../models/authSchema");
const unitSchema = require("../../../models/unitSchema");
const { getCurrentMonth, isValidMonth } = require("../../../helpers/month");
const { initSslSession } = require("../../../helpers/sslcommerz/sslCommerzService");
const { invalidateCache } = require("../../../middlewares/redisCache");

// Initialize SSLCommerz payment session locked to unit.rentAmount
const initSslPayment = asyncHandler(async (req, res) => {
  const month = req.body?.month || getCurrentMonth();

  if (req.user.role !== "tenant") {
    return res.status(403).json({
      success: false,
      message: "Only tenants can initiate rent payments",
    });
  }

  if (!isValidMonth(month)) {
    return res.status(400).json({
      success: false,
      message: "Month is required in YYYY-MM format",
    });
  }

  const tenant = await authSchema.findById(req.user._id);
  if (!tenant || !tenant.assignedUnit) {
    return res.status(400).json({
      success: false,
      message: "You must have an assigned unit before paying rent",
    });
  }

  const unit = await unitSchema.findById(tenant.assignedUnit);
  if (!unit) {
    return res.status(404).json({
      success: false,
      message: "Assigned unit not found",
    });
  }

  const fixedAmount = Number(unit.rentAmount);
  if (!Number.isFinite(fixedAmount) || fixedAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Unit fixed rent is not configured",
    });
  }

  const existing = await paymentSchema.findOne({
    tenant: tenant._id,
    unit: unit._id,
    month,
  });

  if (existing && existing.status === "verified") {
    return res.status(409).json({
      success: false,
      message: `Rent for ${month} is already paid and verified`,
    });
  }

  const tranId = `RN-${unit.unitNumber.replace(/[^A-Z0-9]/gi, "")}-${month.replace("-", "")}-${Date.now().toString(36).toUpperCase()}`;

  const port = process.env.PORT || 5000;
  const baseUrl = process.env.BASE_URL || "/api/v1";
  const serverOrigin = `${req.protocol}://${req.get("host") || `localhost:${port}`}`;

  const successUrl =
    process.env.SSL_SUCCESS_URL ||
    `${serverOrigin}${baseUrl}/payments/subscription/success`;
  const failUrl =
    process.env.SSL_FAIL_URL ||
    `${serverOrigin}${baseUrl}/payments/subscription/fail`;
  const cancelUrl =
    process.env.SSL_CANCEL_URL ||
    `${serverOrigin}${baseUrl}/payments/subscription/cancel`;

  // Create or update pending payment record before redirecting to gateway
  let payment = existing;
  if (payment) {
    payment.amount = fixedAmount;
    payment.transactionId = tranId;
    payment.paymentMethod = "SSLCommerz";
    payment.status = "pending";
    payment.paidAt = new Date();
    await payment.save();
  } else {
    payment = await paymentSchema.create({
      tenant: tenant._id,
      unit: unit._id,
      amount: fixedAmount,
      month,
      transactionId: tranId,
      paymentMethod: "SSLCommerz",
      status: "pending",
    });
  }

  await invalidateCache("admin", "units", "payments", "tenant");

  const sslPayload = {
    total_amount: fixedAmount,
    currency: "BDT",
    tran_id: tranId,
    success_url: successUrl,
    fail_url: failUrl,
    cancel_url: cancelUrl,
    ipn_url: `${serverOrigin}${baseUrl}/payments/ssl/ipn`,
    shipping_method: "NO",
    product_name: `Rent for Unit ${unit.unitNumber} (${month})`,
    product_category: "Property Rent",
    product_profile: "non-physical-goods",
    cus_name: tenant.name,
    cus_email: tenant.email,
    cus_add1: tenant.presentAddress || `Unit ${unit.unitNumber}`,
    cus_city: "Dhaka",
    cus_country: "Bangladesh",
    cus_phone: tenant.phone || "01700000000",
    value_a: String(payment._id),
    value_b: String(tenant._id),
    value_c: String(unit._id),
    value_d: month,
  };

  try {
    const sslResponse = await initSslSession(sslPayload);
    if (sslResponse?.status === "SUCCESS" && sslResponse?.GatewayPageURL) {
      return res.status(200).json({
        success: true,
        message: "SSLCommerz payment session initialized",
        gatewayUrl: sslResponse.GatewayPageURL,
        transactionId: tranId,
        amount: fixedAmount,
        month,
        unitNumber: unit.unitNumber,
        paymentId: payment._id,
      });
    }

    // Fallback to built-in interactive sandbox checkout page if external sandbox is unreachable
    const fallbackUrl = `${serverOrigin}${baseUrl}/payments/ssl/sandbox-checkout?tran_id=${encodeURIComponent(tranId)}&amount=${fixedAmount}&unit=${encodeURIComponent(unit.unitNumber)}&month=${encodeURIComponent(month)}`;
    return res.status(200).json({
      success: true,
      message: "SSLCommerz Sandbox Checkout Ready",
      gatewayUrl: fallbackUrl,
      transactionId: tranId,
      amount: fixedAmount,
      month,
      unitNumber: unit.unitNumber,
      paymentId: payment._id,
      mode: "sandbox-direct",
    });
  } catch (error) {
    const fallbackUrl = `${serverOrigin}${baseUrl}/payments/ssl/sandbox-checkout?tran_id=${encodeURIComponent(tranId)}&amount=${fixedAmount}&unit=${encodeURIComponent(unit.unitNumber)}&month=${encodeURIComponent(month)}`;
    return res.status(200).json({
      success: true,
      message: "SSLCommerz Sandbox Checkout Ready",
      gatewayUrl: fallbackUrl,
      transactionId: tranId,
      amount: fixedAmount,
      month,
      unitNumber: unit.unitNumber,
      paymentId: payment._id,
      mode: "sandbox-direct",
    });
  }
});

module.exports = { initSslPayment };
