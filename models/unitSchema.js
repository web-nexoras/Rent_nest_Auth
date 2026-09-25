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
    status: {
      type: String,
      enum: ["vacant", "occupied"],
      default: "vacant",
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
      },
    ],
  },
  { timestamps: true }
);

// Keep status in sync with assignedTenant automatically
unitSchema.pre("save", function () {
  this.status = this.assignedTenant ? "occupied" : "vacant";
});

module.exports = mongoose.model("Unit", unitSchema);
