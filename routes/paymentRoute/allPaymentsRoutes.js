const express = require("express");
const router = express.Router();

// ----------controllers
const { submitPayment } = require("../../controllers/payments/submitPayment");
const { getMyPayments } = require("../../controllers/payments/getMyPayments");
const { getAllPayments } = require("../../controllers/dashboard/admin/payments/getAllPayments");
const { verifyPayment } = require("../../controllers/dashboard/admin/payments/verifyPayment");
const { rejectPayment } = require("../../controllers/dashboard/admin/payments/rejectPayment");
const { getOverdueTenants } = require("../../controllers/dashboard/admin/payments/getOverdueTenants");
const { getMyReceipt } = require("../../controllers/payments/getMyReceipt");
const { getMonthlyReport } = require("../../controllers/dashboard/admin/payments/getMonthlyReport");


// ----------middlewares
const { adminOnly } = require("../../middlewares/adminOnly");
const { requireApproved } = require("../../middlewares/requireApproved");

router.post("/submit", requireApproved, submitPayment);
router.get("/my-payments", requireApproved, getMyPayments);
router.get("/receipt/:id", requireApproved, getMyReceipt);
router.get("/all-payments", adminOnly, getAllPayments);
router.patch("/verify/:id", adminOnly, verifyPayment);
router.patch("/reject/:id", adminOnly, rejectPayment);
router.get("/overdue", adminOnly, getOverdueTenants);
router.get("/monthly-report", adminOnly, getMonthlyReport);

module.exports = router;
