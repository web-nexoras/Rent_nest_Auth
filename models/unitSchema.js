const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema(
  {
    unitNumber: {
      type: String,
      required: [true, "Unit number is required"],
      unique: true,
      trim: true,
    },
    floor: {
      type: String,
      trim: true,
    },
    sizeSqft: {
      type: Number,
      min: 0,
    },
    bedrooms: {
      type: Number,
      min: 0,
    },
    rentAmount: {
      type: Number,
      required: [true, "Rent amount is required"],
      min: 0,
    },
    rentDueDay: {
      type: Number,
      min: 1,
      max: 31,
      default: 1,
    },
    status: {
      type: String,
      enum: ["vacant", "occupied"],
      default: "vacant",
    },
    assignedMonth: {
      type: String,
      match: /^\d{4}-(0[1-9]|1[0-2])$/,
      default: null,
    },
    assignedTenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    description: {
      type: String,
      trim: true,
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { timestamps: true },
);

// Sync unit occupancy status with assignedTenant
unitSchema.pre("save", function () {
  this.status = this.assignedTenant ? "occupied" : "vacant";
  if (!this.assignedTenant) this.assignedMonth = null;
});

module.exports = mongoose.model("Unit", unitSchema);
