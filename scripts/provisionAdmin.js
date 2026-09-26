require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/authSchema");

async function provisionAdmin() {
  const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME;
  const phone = process.env.ADMIN_PHONE;

  if (!email || !password || !name || !phone) {
    throw new Error("Set ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, and ADMIN_PHONE in .env first");
  }

  if (password.length < 6) {
    throw new Error("ADMIN_PASSWORD must be at least 6 characters");
  }

  if (!process.env.DB_URL) {
    throw new Error("DB_URL is not configured");
  }

  await mongoose.connect(process.env.DB_URL);

  const matchingUsers = await User.find({ email }).select("+password");
  if (matchingUsers.length > 1) {
    throw new Error(`Found ${matchingUsers.length} records for ${email}. Remove duplicate user records first, then run this script again.`);
  }

  let user = matchingUsers[0];
  const isNew = !user;

  if (!user) {
    user = new User({ email });
  }

  user.name = name;
  user.phone = phone;
  user.password = password;
  user.role = "admin";
  user.approvalStatus = "approved";
  user.isVerified = true;
  user.isActive = true;
  user.otp = null;
  user.otpExpiry = null;

  await user.save();

  console.log(`Admin ${isNew ? "created" : "updated"}: ${email}`);
}

provisionAdmin()
  .catch((error) => {
    console.error("Admin provisioning failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
