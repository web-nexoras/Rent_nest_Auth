const { asyncHandler } = require("../../../../middlewares/asyncHandler");
const mongoose = require("mongoose");
const paymentSchema = require("../../../../models/paymentSchema");
const authSchema = require("../../../../models/authSchema");
const unitSchema = require("../../../../models/unitSchema");
const { sendNoticeEmail } = require("../../../../helpers/email/mailService");

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

  const [tenant, unit] = await Promise.all([
    authSchema.findById(payment.tenant).select("name email"),
    unitSchema.findById(payment.unit).select("unitNumber"),
  ]);
  if (tenant?.email) {
    try {
      await sendNoticeEmail({
        email: tenant.email,
        subject: `Rent receipt for ${payment.month}`,
        title: "Rent payment verified",
        message: `Hello ${tenant.name}, your rent payment has been verified. Keep this email as your payment receipt.`,
        details: { Receipt: `RN-${payment._id}`, Unit: unit?.unitNumber || "", Month: payment.month, Amount: `${payment.amount} BDT`, Method: payment.paymentMethod, Transaction: payment.transactionId, Status: "Verified" },
      });
    } catch (error) {
      console.error(`Receipt email failed for payment ${payment._id}:`, error.message);
    }
  }

  return res.status(200).json({
    success: true,
    message: "Payment verified successfully",
    payment,
  });
});

module.exports = { verifyPayment };
