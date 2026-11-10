const express = require("express");
const router = express.Router();

const { submitPayment } = require("../../controllers/payments/submitPayment");
const { getMyPayments } = require("../../controllers/payments/getMyPayments");
const { getAllPayments } = require("../../controllers/payments/getAllPayments");
const { verifyPayment } = require("../../controllers/payments/verifyPayment");
const { rejectPayment } = require("../../controllers/payments/rejectPayment");
const { getOverdueTenants } = require("../../controllers/payments/getOverdueTenants");
const { getMyReceipt } = require("../../controllers/payments/getMyReceipt");
const { getMonthlyReport } = require("../../controllers/payments/getMonthlyReport");
const {
  sendTenantReminderController,
  sendBulkRemindersController,
} = require("../../controllers/payments/sendRentReminder");
const { initSslPayment } = require("../../controllers/payments/sslcommerz/initSslPayment");
const {
  sslPaymentSuccess,
  sslPaymentFail,
  sslPaymentCancel,
  renderSslSandboxCheckout,
} = require("../../controllers/payments/sslcommerz/sslCallbacks");

const { adminOnly } = require("../../middlewares/adminOnly");
const { requireApproved } = require("../../middlewares/requireApproved");
const { cacheGet, clearCacheOnSuccess } = require("../../middlewares/redisCache");

const clearPaymentCache = clearCacheOnSuccess("admin", "units", "payments", "tenant");

// Manual payment submission & SSLCommerz online checkout
router.post("/submit", requireApproved, clearPaymentCache, submitPayment);
router.post("/ssl/init", requireApproved, clearPaymentCache, initSslPayment);
router.get("/ssl/sandbox-checkout", renderSslSandboxCheckout);
router.post("/subscription/success", sslPaymentSuccess);
router.get("/subscription/success", sslPaymentSuccess);
router.post("/subscription/fail", sslPaymentFail);
router.get("/subscription/fail", sslPaymentFail);
router.post("/subscription/cancel", sslPaymentCancel);
router.get("/subscription/cancel", sslPaymentCancel);
router.post("/ssl/ipn", sslPaymentSuccess);

// Tenant payment history & receipts
router.get("/my-payments", requireApproved, cacheGet("payments", 20), getMyPayments);
router.get("/receipt/:id", requireApproved, cacheGet("payments", 30), getMyReceipt);

// Admin payment verification, reports, and reminders
router.get("/all-payments", adminOnly, cacheGet("payments", 20), getAllPayments);
router.patch("/verify/:id", adminOnly, clearPaymentCache, verifyPayment);
router.patch("/reject/:id", adminOnly, clearPaymentCache, rejectPayment);
router.get("/overdue", adminOnly, cacheGet("payments", 20), getOverdueTenants);
router.get("/monthly-report", adminOnly, cacheGet("payments", 20), getMonthlyReport);
router.post("/remind/:tenantId", adminOnly, clearPaymentCache, sendTenantReminderController);
router.post("/remind-all", adminOnly, clearPaymentCache, sendBulkRemindersController);

module.exports = router;
