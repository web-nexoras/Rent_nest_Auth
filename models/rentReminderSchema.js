const mongoose = require("mongoose");

const rentReminderSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      default: null,
    },
    month: {
      type: String,
      required: true,
      match: /^\d{4}-(0[1-9]|1[0-2])$/,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    firstAlertSentAt: {
      type: Date,
      default: null,
    },
    lastOverdueSentDate: {
      type: String, // YYYY-MM-DD to prevent duplicate daily overdue emails
      default: null,
    },
    reminderCount: {
      type: Number,
      default: 1,
    },
    lastStage: {
      type: String,
      enum: ["due_alert", "overdue_10th", "manual_admin"],
      default: "due_alert",
    },
    lastMessage: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

rentReminderSchema.index({ tenant: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("RentReminder", rentReminderSchema);
