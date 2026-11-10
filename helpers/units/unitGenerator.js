// 48-unit building blueprint across Floors A-L (4 apartment tiers per floor)
const FLOORS = [
  { letter: "A", level: 1 },
  { letter: "B", level: 2 },
  { letter: "C", level: 3 },
  { letter: "D", level: 4 },
  { letter: "E", level: 5 },
  { letter: "F", level: 6 },
  { letter: "G", level: 7 },
  { letter: "H", level: 8 },
  { letter: "I", level: 9 },
  { letter: "J", level: 10 },
  { letter: "K", level: 11 },
  { letter: "L", level: 12 },
];

const UNIT_TIERS = [
  {
    slot: 1,
    type: "Corner Family Suite",
    sizeSqft: 1650,
    bedrooms: 3,
    baseRent: 28000,
    description:
      "Corner Family Suite · 3 Bedrooms, 3 Baths, South-facing panoramic balcony, dedicated covered parking.",
  },
  {
    slot: 2,
    type: "Standard Family Residence",
    sizeSqft: 1350,
    bedrooms: 3,
    baseRent: 22000,
    description:
      "Standard Family Residence · 3 Bedrooms, 2 Baths, open dining/living layout, dual balconies.",
  },
  {
    slot: 3,
    type: "Executive Couple Suite",
    sizeSqft: 1050,
    bedrooms: 2,
    baseRent: 16500,
    description:
      "Executive Couple Suite · 2 Bedrooms, 2 Baths, modern modular kitchen, high-speed fiber ready.",
  },
  {
    slot: 4,
    type: "Compact Urban Studio",
    sizeSqft: 800,
    bedrooms: 2,
    baseRent: 12500,
    description:
      "Compact Urban Studio · 2 Bedrooms, 1 Bath, efficient layout ideal for professionals or small families.",
  },
];

function generateStandardBuildingUnits() {
  const units = [];

  for (const { letter, level } of FLOORS) {
    // Upper-floor view premium for Floors E-H (+500) and I-L (+1000)
    const floorPremium = level >= 9 ? 1000 : level >= 5 ? 500 : 0;

    for (const tier of UNIT_TIERS) {
      const unitNumber = `${letter}-${level}${String(tier.slot).padStart(2, "0")}`;
      units.push({
        unitNumber,
        floor: `${letter} (Floor ${level})`,
        sizeSqft: tier.sizeSqft,
        bedrooms: tier.bedrooms,
        rentAmount: tier.baseRent + floorPremium,
        rentDueDay: 5,
        status: "vacant",
        description: tier.description,
        images: [],
      });
    }
  }

  return units;
}

module.exports = {
  FLOORS,
  UNIT_TIERS,
  generateStandardBuildingUnits,
};
