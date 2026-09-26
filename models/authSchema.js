const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const authSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [25, "Name must not exceed 25 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    otp: {
      type: String,
      default: null,
      select: false,
    },

    otpExpiry: {
      type: Date,
      default: null,
      select: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      enum: ["admin", "tenant"],
      default: "tenant",
    },

    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    assignedUnit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    presentAddress: {
      type: String,
      trim: true,
    },

    permanentAddress: {
      type: String,
      trim: true,
    },

    nidNumber: {
      type: String,
      trim: true,
    },

    occupation: {
      type: String,
      trim: true,
    },

    profileImage: {
      type: String,
      default: null,
    },

    resetPasswordToken: {
      type: String,
      default: null,
      select: false,
    },

    resetPasswordExpiry: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// ---------------- Admins are auto-approved on creation
authSchema.pre("save", function (next) {
  if (this.role === "admin") {
    this.approvalStatus = "approved";
  }
  next();
});

// ---------------- Hash password before saving
authSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ---------------- Compare password
authSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", authSchema);