const crypto = require("crypto");
const jwt = require("jsonwebtoken");

// Strict email regex requiring valid local part, domain, and 2-10 alpha TLD
const STRICT_EMAIL_REGEX =
  /^[a-zA-Z0-9](?:[a-zA-Z0-9._%+-]{0,62}[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,10}$/;

const BLOCKED_EMAIL_DOMAINS = new Set([
  "test.com",
  "example.com",
  "abc.com",
  "xyz.com",
  "fake.com",
  "mailinator.com",
  "tempmail.com",
]);

function isValidEmail(email) {
  if (typeof email !== "string") return false;
  const trimmed = email.trim().toLowerCase();
  if (trimmed.length < 6 || trimmed.length > 100) return false;
  if (trimmed.includes("..")) return false;
  return STRICT_EMAIL_REGEX.test(trimmed);
}

const cleanPhone = (phone) => String(phone ?? "").replace(/[\s\-()]/g, "");

// Bangladesh mobile numbers across all operator prefixes (013-019).
const STRICT_PHONE_REGEX = /^(?:\+?88)?01[3-9]\d{8}$/;

const isValidPhone = (phone) => {
  if (!phone) return false;
  return STRICT_PHONE_REGEX.test(cleanPhone(phone));
};

// Canonical storage format: +8801XXXXXXXXX
const normalizePhone = (phone) => {
  return "+88" + cleanPhone(phone).replace(/^(?:\+?88)/, "");
};

const generateOTP = () => crypto.randomInt(1000, 10000).toString();

const generateAccessToken = (user) =>
  jwt.sign(
    { _id: user._id, email: user.email, role: user.role },
    process.env.JWT_SEC,
    { expiresIn: "15m" },
  );

const generateRefreshToken = (user) =>
  jwt.sign(
    { _id: user._id, email: user.email, role: user.role },
    process.env.JWT_SEC,
    { expiresIn: "7d" },
  );

const generateResetToken = () => crypto.randomBytes(32).toString("hex");

const hashToken = (value) =>
  crypto.createHash("sha256").update(String(value)).digest("hex");

module.exports = {
  STRICT_EMAIL_REGEX,
  STRICT_PHONE_REGEX,
  BLOCKED_EMAIL_DOMAINS,
  isValidEmail,
  cleanPhone,
  isValidPhone,
  normalizePhone,
  generateOTP,
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  hashToken,
};
