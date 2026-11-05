const express = require("express");
const router = express.Router();
const { imageUpload } = require("../../helpers/upload");

// ----------controllerss
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

// ----------middleweres
const { adminOnly } = require("../../middlewares/adminOnly");
const { requireApproved } = require("../../middlewares/requireApproved");

router.post(
  "/create",
  requireApproved,
  imageUpload.array("images", 3),
  createMaintenance,
);
router.get("/getmy", requireApproved, getMyMaintenance);
router.get("/getall", adminOnly, getAllMaintenance);
router.get("/single/:id",requireApproved, getSingleMaintenance);
router.delete("/del/:id", requireApproved, deleteMaintenance);
router.patch("/update/:id", adminOnly, updateMaintenanceStatus);

module.exports = router;
