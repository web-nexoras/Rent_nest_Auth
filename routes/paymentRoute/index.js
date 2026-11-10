const express = require("express");
const router = express.Router();

const allPaymentsRoutes = require("./allPaymentsRoutes.js");
const {
  sslPaymentSuccess,
  sslPaymentFail,
  sslPaymentCancel,
  renderSslSandboxCheckout,
} = require("../../controllers/payments/sslcommerz/sslCallbacks");

// --------middleware
const { authMiddleware } = require("../../middlewares/authMiddleware.js");
const { checkActive } = require("../../middlewares/checkActive.js");

// Public SSLCommerz Gateway Callbacks (called by SSLCommerz servers without JWT cookies)
router.get("/payment/ssl/sandbox-checkout", renderSslSandboxCheckout);
router.post("/payment/subscription/success", sslPaymentSuccess);
router.get("/payment/subscription/success", sslPaymentSuccess);
router.post("/payment/subscription/fail", sslPaymentFail);
router.get("/payment/subscription/fail", sslPaymentFail);
router.post("/payment/subscription/cancel", sslPaymentCancel);
router.get("/payment/subscription/cancel", sslPaymentCancel);
router.post("/payment/ssl/ipn", sslPaymentSuccess);

// Also support /payments/subscription/* in case SSL_SUCCESS_URL in .env uses /payments/
router.get("/payments/ssl/sandbox-checkout", renderSslSandboxCheckout);
router.post("/payments/subscription/success", sslPaymentSuccess);
router.get("/payments/subscription/success", sslPaymentSuccess);
router.post("/payments/subscription/fail", sslPaymentFail);
router.get("/payments/subscription/fail", sslPaymentFail);
router.post("/payments/subscription/cancel", sslPaymentCancel);
router.get("/payments/subscription/cancel", sslPaymentCancel);
router.post("/payments/ssl/ipn", sslPaymentSuccess);

// Authenticated Payment Routes
router.use("/payment", authMiddleware, checkActive, allPaymentsRoutes);

module.exports = router;
