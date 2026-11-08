const mongoose = require("mongoose");
const { asyncHandler } = require("../../../../middlewares/asyncHandler");
const paymentSchema = require("../../../../models/paymentSchema");

const getMyReceipt = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid payment ID" });
  const payment = await paymentSchema.findOne({ _id: id, tenant: req.user._id, status: "verified" })
    .populate("tenant", "name email")
    .populate("unit", "unitNumber floor");
  if (!payment) return res.status(404).json({ success: false, message: "Verified payment receipt not found" });
  return res.json({ success: true, receipt: { receiptNumber: `RN-${payment._id}`, tenant: payment.tenant, unit: payment.unit, month: payment.month, amount: payment.amount, paymentMethod: payment.paymentMethod, transactionId: payment.transactionId, paidAt: payment.paidAt, verifiedAt: payment.verifiedAt, status: payment.status } });
});

module.exports = { getMyReceipt };
