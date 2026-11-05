const authSchema = require("../../models/authSchema");
const paymentSchema = require("../../models/paymentSchema");
const rentReminderSchema = require("../../models/rentReminderSchema");
const unitSchema = require("../../models/unitSchema");
const { getCurrentMonth } = require("../month");
const { sendNoticeEmail } = require("../email/mailService");

const sendMonthlyRentReminders = async () => {
  const month = getCurrentMonth();
  const tenants = await authSchema.find({ role: "tenant", approvalStatus: "approved", isActive: true, assignedUnit: { $ne: null } }).select("name email assignedUnit");
  for (const tenant of tenants) {
    const payment = await paymentSchema.findOne({ tenant: tenant._id, month, status: { $in: ["pending", "verified"] } }).select("_id");
    if (payment) continue;
    const unit = await unitSchema.findById(tenant.assignedUnit).select("unitNumber rentAmount");
    if (!unit) continue;
    let reminder;
    try {
      reminder = await rentReminderSchema.create({ tenant: tenant._id, month });
    } catch (error) {
      if (error.code === 11000) continue;
      throw error;
    }
    try {
      await sendNoticeEmail({
        email: tenant.email,
        subject: `Rent reminder for ${month}`,
        title: `Rent reminder: ${month}`,
        message: `Hello ${tenant.name}, your rent payment for ${month} is due.`,
        details: { Unit: unit.unitNumber, Month: month, "Amount due": `${unit.rentAmount} BDT` },
      });
    } catch (error) {
      await rentReminderSchema.deleteOne({ _id: reminder._id });
      console.error(`Rent reminder failed for tenant ${tenant._id}:`, error.message);
    }
  }
};

module.exports = { sendMonthlyRentReminders };
