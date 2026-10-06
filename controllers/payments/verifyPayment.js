const { asyncHandler } = require("../../middlewares/asyncHandler");
const mongoose = require("mongoose");
const paymentSchema = require("../../models/paymentSchema");

const verifyPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid payment ID",
    });
  }

  const payment = await paymentSchema.findById(id);

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: "Payment not found",
    });
  }

  if (payment.status !== "pending") {
    return res.status(400).json({
      success: false,
      message: `This payment is already ${payment.status}`,
    });
  }

  payment.status = "verified";
  payment.verifiedBy = req.user._id;
  payment.verifiedAt = new Date();

  await payment.save();

  return res.status(200).json({
    success: true,
    message: "Payment verified successfully",
    payment,
  });
});

module.exports = { verifyPayment };