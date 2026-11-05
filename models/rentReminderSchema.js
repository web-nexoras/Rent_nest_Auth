const mongoose = require("mongoose");

const rentReminderSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  month: { type: String, required: true, match: /^\d{4}-(0[1-9]|1[0-2])$/ },
  sentAt: { type: Date, default: Date.now },
});

rentReminderSchema.index({ tenant: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("RentReminder", rentReminderSchema);
