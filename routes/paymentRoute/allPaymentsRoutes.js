const express = require("express");
const router = express.Router();

// ----------controllers
const { submitPayment } = require("../../controllers/payments/submitPayment");
const { getMyPayments } = require("../../controllers/dashboard/tenant/payments/getMyPayments");
const { getAllPayments } = require("../../controllers/dashboard/admin/payments/getAllPayments");
const { verifyPayment } = require("../../controllers/dashboard/admin/payments/verifyPayment");
const { rejectPayment } = require("../../controllers/dashboard/admin/payments/rejectPayment");
const { getOverdueTenants } = require("../../controllers/dashboard/admin/payments/getOverdueTenants");
const { getMyReceipt } = require("../../controllers/dashboard/tenant/payments/getMyReceipt");
const { getMonthlyReport } = require("../../controllers/dashboard/admin/payments/getMonthlyReport");
const {
  sendTenantReminderController,
  sendBulkRemindersController,
} = require("../../controllers/dashboard/admin/payments/sendRentReminder");
const { initSslPayment } = require("../../controllers/payments/sslcommerz/initSslPayment");
const {
  sslPaymentSuccess,
  sslPaymentFail,
  sslPaymentCancel,
  renderSslSandboxCheckout,
} = require("../../controllers/payments/sslcommerz/sslCallbacks");

// ----------middlewares
const { adminOnly } = require("../../middlewares/adminOnly");
const { requireApproved } = require("../../middlewares/requireApproved");
const { cacheGet, clearCacheOnSuccess } = require("../../middlewares/redisCache");

const clearPaymentCache = clearCacheOnSuccess("admin", "units", "payments", "tenant");

// Manual / Reference Payment
router.post("/submit", requireApproved, clearPaymentCache, submitPayment);

// SSLCommerz Online Payment Gateway
router.post("/ssl/init", requireApproved, clearPaymentCache, initSslPayment);
router.get("/ssl/sandbox-checkout", renderSslSandboxCheckout);
router.post("/subscription/success", sslPaymentSuccess);
router.get("/subscription/success", sslPaymentSuccess);
router.post("/subscription/fail", sslPaymentFail);
router.get("/subscription/fail", sslPaymentFail);
router.post("/subscription/cancel", sslPaymentCancel);
router.get("/subscription/cancel", sslPaymentCancel);
router.post("/ssl/ipn", sslPaymentSuccess);

// Tenant Payment Queries
router.get("/my-payments", requireApproved, cacheGet("payments", 20), getMyPayments);
router.get("/receipt/:id", requireApproved, cacheGet("payments", 30), getMyReceipt);

// Admin Payment Management & Reminders
router.get("/all-payments", adminOnly, cacheGet("payments", 20), getAllPayments);
router.patch("/verify/:id", adminOnly, clearPaymentCache, verifyPayment);
router.patch("/reject/:id", adminOnly, clearPaymentCache, rejectPayment);
router.get("/overdue", adminOnly, cacheGet("payments", 20), getOverdueTenants);
router.get("/monthly-report", adminOnly, cacheGet("payments", 20), getMonthlyReport);
router.post("/remind/:tenantId", adminOnly, clearPaymentCache, sendTenantReminderController);
router.post("/remind-all", adminOnly, clearPaymentCache, sendBulkRemindersController);

module.exports = router;
