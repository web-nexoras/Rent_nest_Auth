const authSchema = require("../../../../models/authSchema");
const { asyncHandler } = require("../../../../middlewares/asyncHandler");

const getMyUnit = asyncHandler(async (req, res) => {
  if (req.user.role !== "tenant") {
    return res.status(403).json({
      success: false,
      message: "Only tenants have an assigned unit",
    });
  }

  const user = await authSchema
    .findById(req.user._id)
    .populate("assignedUnit");

  if (!user?.assignedUnit) {
    return res.status(200).json({
      success: true,
      message: "No unit assigned yet",
      unit: null,
    });
  }

  return res.status(200).json({
    success: true,
    unit: user.assignedUnit,
  });
});

module.exports = { getMyUnit };
