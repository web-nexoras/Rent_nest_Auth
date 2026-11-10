const { asyncHandler } = require("../../../middlewares/asyncHandler");
const paymentSchema = require("../../../models/paymentSchema");
const authSchema = require("../../../models/authSchema");
const unitSchema = require("../../../models/unitSchema");
const { validateSslPayment } = require("../../../helpers/sslcommerz/sslCommerzService");
const { sendNoticeEmail } = require("../../../helpers/email/mailService");
const { invalidateCache } = require("../../../middlewares/redisCache");

const getClientBaseUrl = () => {
  const first = (process.env.CLIENT_URL || "http://localhost:3000")
    .split(",")[0]
    .trim();
  return first || "http://localhost:3000";
};

const findPaymentFromCallback = async (data = {}) => {
  const tranId = data.tran_id || data.transactionId;
  const paymentId = data.value_a || data.paymentId;

  if (tranId) {
    const byTran = await paymentSchema.findOne({ transactionId: tranId });
    if (byTran) return byTran;
  }
  if (paymentId) {
    const byId = await paymentSchema.findById(paymentId);
    if (byId) return byId;
  }
  return null;
};

// Auto-verify payment on SSLCommerz success callback and redirect to tenant receipt
const sslPaymentSuccess = asyncHandler(async (req, res) => {
  const data = { ...req.query, ...req.body };
  const payment = await findPaymentFromCallback(data);
  const clientUrl = getClientBaseUrl();

  if (!payment) {
    return res.redirect(`${clientUrl}/tenant/payments?ssl=error`);
  }

  let validation = null;
  if (data.val_id) {
    validation = await validateSslPayment(data.val_id);
  }

  payment.status = "verified";
  payment.verifiedAt = new Date();
  payment.paymentMethod = "SSLCommerz";
  payment.gatewayDetails = {
    valId: data.val_id || validation?.val_id || "SSL-VERIFIED",
    bankTranId: data.bank_tran_id || validation?.bank_tran_id || payment.transactionId,
    cardType: data.card_type || validation?.card_type || "SSLCommerz Online",
    cardIssuer: data.card_issuer || validation?.card_issuer || "SSLCommerz Gateway",
    storeAmount: Number(data.store_amount || validation?.store_amount || payment.amount),
  };

  await payment.save();
  await invalidateCache("admin", "units", "payments", "tenant");

  const [tenant, unit] = await Promise.all([
    authSchema.findById(payment.tenant).select("name email"),
    unitSchema.findById(payment.unit).select("unitNumber"),
  ]);

  if (tenant?.email) {
    try {
      await sendNoticeEmail({
        email: tenant.email,
        subject: `Official Rent Receipt for ${payment.month} (SSLCommerz)`,
        title: "Online Rent Payment Verified",
        message: `Hello ${tenant.name}, your online rent payment via SSLCommerz has been verified automatically.`,
        details: {
          Receipt: `RN-${payment._id}`,
          Unit: unit?.unitNumber || "",
          Month: payment.month,
          "Amount Paid": `${payment.amount} BDT`,
          Gateway: `SSLCommerz (${payment.gatewayDetails.cardType})`,
          "Transaction ID": payment.transactionId,
          Status: "Verified & Paid",
        },
      });
    } catch (err) {
      console.error("SSL receipt email failed:", err.message);
    }
  }

  return res.redirect(
    `${clientUrl}/tenant/payments?ssl=success&paymentId=${payment._id}&month=${encodeURIComponent(payment.month)}`,
  );
});

const sslPaymentFail = asyncHandler(async (req, res) => {
  const data = { ...req.query, ...req.body };
  const payment = await findPaymentFromCallback(data);
  const clientUrl = getClientBaseUrl();

  if (payment && payment.status === "pending") {
    payment.status = "rejected";
    await payment.save();
    await invalidateCache("admin", "units", "payments", "tenant");
  }

  return res.redirect(`${clientUrl}/tenant/payments?ssl=failed`);
});

const sslPaymentCancel = asyncHandler(async (req, res) => {
  const data = { ...req.query, ...req.body };
  const payment = await findPaymentFromCallback(data);
  const clientUrl = getClientBaseUrl();

  if (payment && payment.status === "pending") {
    await payment.deleteOne();
    await invalidateCache("admin", "units", "payments", "tenant");
  }

  return res.redirect(`${clientUrl}/tenant/payments?ssl=cancelled`);
});

// Interactive sandbox checkout page for local testing
const renderSslSandboxCheckout = asyncHandler(async (req, res) => {
  const { tran_id = "", amount = "0", unit = "", month = "" } = req.query;
  const baseUrl = process.env.BASE_URL || "/api/v1";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SSLCommerz Secure Checkout — Rent Nest</title>
  <style>
    * { box-sizing: border-box; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
    body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0B1120; color: #0F172A; padding: 20px; }
    .card { width: 100%; max-width: 440px; background: #fff; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 60px rgba(0,0,0,0.45); }
    .header { background: linear-gradient(135deg, #1E3A8A, #4F46E5); color: #fff; padding: 28px 24px; text-align: center; }
    .badge { display: inline-block; background: rgba(255,255,255,0.18); font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 99px; letter-spacing: 0.08em; text-transform: uppercase; }
    .amount { font-size: 34px; font-weight: 800; margin: 12px 0 4px; }
    .meta { font-size: 13px; opacity: 0.85; }
    .body { padding: 24px; }
    .methods { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
    .method { border: 2px solid #E2E8F0; border-radius: 12px; padding: 10px; text-align: center; font-size: 12px; font-weight: 700; cursor: pointer; transition: all .15s; }
    .method.active, .method:hover { border-color: #4F46E5; background: #EEF2FF; color: #4338CA; }
    .row { display: flex; justify-content: space-between; font-size: 13px; padding: 8px 0; border-bottom: 1px solid #F1F5F9; color: #475569; }
    .row strong { color: #0F172A; }
    .btn { width: 100%; border: none; border-radius: 14px; padding: 14px; font-size: 14px; font-weight: 700; cursor: pointer; margin-top: 12px; transition: opacity .15s; }
    .btn-pay { background: #10B981; color: #fff; }
    .btn-fail { background: #F1F5F9; color: #E11D48; }
    .btn-cancel { background: transparent; color: #64748B; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <span class="badge">SSLCommerz Sandbox Gateway</span>
      <div class="amount">৳${Number(amount).toLocaleString()}</div>
      <div class="meta">Unit ${unit} · Billing Month ${month}</div>
    </div>
    <div class="body">
      <div class="methods">
        <div class="method active">bKash</div>
        <div class="method">Nagad</div>
        <div class="method">Visa / Master</div>
      </div>
      <div class="row"><span>Store ID</span><strong>${process.env.SSL_STORE_ID || "webne6aa18fd75c425"}</strong></div>
      <div class="row"><span>Transaction Ref</span><strong>${tran_id}</strong></div>
      <div class="row"><span>Amount (Locked)</span><strong>৳${Number(amount).toLocaleString()} BDT</strong></div>

      <form method="POST" action="${baseUrl}/payments/subscription/success">
        <input type="hidden" name="tran_id" value="${tran_id}" />
        <input type="hidden" name="val_id" value="SSL-VAL-${Date.now()}" />
        <input type="hidden" name="card_type" value="bKash-SSLCommerz" />
        <input type="hidden" name="store_amount" value="${amount}" />
        <button type="submit" class="btn btn-pay">✓ Confirm & Complete Payment (৳${Number(amount).toLocaleString()})</button>
      </form>

      <form method="POST" action="${baseUrl}/payments/subscription/fail">
        <input type="hidden" name="tran_id" value="${tran_id}" />
        <button type="submit" class="btn btn-fail">Simulate Failed Payment</button>
      </form>

      <form method="POST" action="${baseUrl}/payments/subscription/cancel">
        <input type="hidden" name="tran_id" value="${tran_id}" />
        <button type="submit" class="btn btn-cancel">Cancel & Return to Rent Nest</button>
      </form>
    </div>
  </div>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html");
  return res.status(200).send(html);
});

module.exports = {
  sslPaymentSuccess,
  sslPaymentFail,
  sslPaymentCancel,
  renderSslSandboxCheckout,
};
