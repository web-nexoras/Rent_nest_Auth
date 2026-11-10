const express = require("express");
const router = express.Router();
const { imageUpload } = require("../../helpers/upload");
const {
  createMaintenance,
} = require("../../controllers/maintenance/createMaintenance");
const {
  getMyMaintenance,
} = require("../../controllers/maintenance/getMyMaintenance");
const {
  getAllMaintenance,
} = require("../../controllers/maintenance/getAllMaintenance");
const {
  getSingleMaintenance,
} = require("../../controllers/maintenance/getSingleMaintenance");
const {
  deleteMaintenance,
} = require("../../controllers/maintenance/deleteMaintenance");
const {
  updateMaintenanceStatus,
} = require("../../controllers/maintenance/updateMaintenance");

const { adminOnly } = require("../../middlewares/adminOnly");
const { requireApproved } = require("../../middlewares/requireApproved");
const { cacheGet, clearCacheOnSuccess } = require("../../middlewares/redisCache");

const clearMaintenanceCache = clearCacheOnSuccess("maintenance", "admin", "tenant");

router.post(
  "/create",
  requireApproved,
  clearMaintenanceCache,
  imageUpload.array("images", 3),
  createMaintenance,
);
router.get("/getmy", requireApproved, cacheGet("maintenance", 20), getMyMaintenance);
router.get("/getall", adminOnly, cacheGet("maintenance", 20), getAllMaintenance);
router.get("/single/:id", requireApproved, cacheGet("maintenance", 20), getSingleMaintenance);
router.delete("/del/:id", requireApproved, clearMaintenanceCache, deleteMaintenance);
router.patch("/update/:id", adminOnly, clearMaintenanceCache, updateMaintenanceStatus);

module.exports = router;
