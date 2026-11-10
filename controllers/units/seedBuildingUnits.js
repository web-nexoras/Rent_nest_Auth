const unitSchema = require("../../models/unitSchema");
const { asyncHandler } = require("../../middlewares/asyncHandler");
const { generateStandardBuildingUnits } = require("../../helpers/units/unitGenerator");
const { invalidateCache } = require("../../middlewares/redisCache");

// Seed the 48 building units (A-101 to L-1204) without overwriting existing units
const seedBuildingUnits = asyncHandler(async (req, res) => {
  const blueprint = generateStandardBuildingUnits();
  const existing = await unitSchema.find({}).select("unitNumber");
  const existingNumbers = new Set(existing.map((u) => u.unitNumber.toUpperCase()));

  const toInsert = blueprint.filter(
    (unit) => !existingNumbers.has(unit.unitNumber.toUpperCase()),
  );

  if (toInsert.length > 0) {
    await unitSchema.insertMany(toInsert, { ordered: false });
  }

  await invalidateCache("admin", "units");

  const totalUnits = await unitSchema.countDocuments({});

  return res.status(201).json({
    success: true,
    message:
      toInsert.length > 0
        ? `Generated ${toInsert.length} building units (Total: ${totalUnits} units across Floors A–L)`
        : "All 48 standard building units (Floors A–L) are already initialized",
    createdCount: toInsert.length,
    totalUnits,
  });
});

module.exports = { seedBuildingUnits };
