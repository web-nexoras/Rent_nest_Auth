const { asyncHandler } = require("../../middlewares/asyncHandler");
const authSchema = require("../../models/authSchema");

// Admin only.
const getPendingUsers = asyncHandler(async (req, res) => {
  const pendingUsers = await authSchema
    .find({ role: "tenant", approvalStatus: "pending" })
    .select("name email phone occupation presentAddress createdAt")
    .sort({ createdAt: 1 }); 

  return res.status(200).json({
    success: true,
    count: pendingUsers.length,
    pendingUsers,
  });
});

module.exports = { getPendingUsers };