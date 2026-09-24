const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Tenant is required"],
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: [true, "Unit is required"]
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: 0
    },
    month: {
      type: String, 
      required: [true, "Payment month is required"],
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, "Month must be in YYYY-MM format"],
    },
    transactionId: {
      type: String,
      required: [true, "Transaction ID is required"],
      trim: true
    },
    paymentMethod: {
      type: String,
      enum: ["bKash", "Nagad", "Bank", "Cash"],
      required: [true, "Payment method is required"]
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending"
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    paidAt: {
      type: Date,
      default: Date.now
    },
    verifiedAt: {
      type: Date,
      default: null
    },
  },
  { timestamps: true }
);

// One payment per tenant per unit per month
paymentSchema.index({ tenant: 1, unit: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("Payment", paymentSchema);
