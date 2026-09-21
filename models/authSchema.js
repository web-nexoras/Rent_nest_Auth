const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const authSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [4, "Password must be at least 4 characters"],
      maxlength: [6, "Password must not exceed 6 characters"],
      select: false,
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
  },
  { timestamps: true },
);

//--------- Admins are auto approved 
authSchema.pre("save", function (next) {
  if (this.role === "admin") {
    this.approvalStatus = "approved";
  }
  next();
});

//---------- Hash password before saving to the database
authSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//--------- compare entered password with hashed one
authSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", authSchema);
