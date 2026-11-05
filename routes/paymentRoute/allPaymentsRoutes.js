const express = require("express");
const router = express.Router();

// ----------controllers
const { submitPayment } = require("../../controllers/payments/submitPayment");
const { getMyPayments } = require("../../controllers/payments/getMyPayments");
const { getAllPayments } = require("../../controllers/payments/getAllPayments");
const { verifyPayment } = require("../../controllers/payments/verifyPayment");
const { rejectPayment } = require("../../controllers/payments/rejectPayment");
const { getOverdueTenants } = require("../../controllers/payments/getOverdueTenants");
const { getMyReceipt } = require("../../controllers/payments/getMyReceipt");
const { getMonthlyReport } = require("../../controllers/payments/getMonthlyReport");


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
