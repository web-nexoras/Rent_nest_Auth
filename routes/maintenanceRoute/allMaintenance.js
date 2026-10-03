const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();
// ----------controllerss


// ----------middleweres
const { adminOnly } = require("../../middlewares/adminOnly");
const { requireApproved } = require("../../middlewares/requireApproved");

const { createMaintenance } = require("../../controllers/maintenance/createMaintenance");
const { getMyMaintenance } = require("../../controllers/maintenance/getMyMaintenance");
const { getAllMaintenance } = require("../../controllers/maintenance/getAllMaintenance");
const { getSingleMaintenance } = require("../../controllers/maintenance/getSingleMaintenance");
const { deleteMaintenance } = require("../../controllers/maintenance/deleteMaintenance");

router.post("/create", upload.array("images", 3), createMaintenance);
router.get("/getmy", getMyMaintenance);
router.get("/getall", getAllMaintenance);
router.get("/single/:id", getSingleMaintenance);
router.delete("/del/:id",  deleteMaintenance);
// router.patch("/update/:id", adminOnly, updateNotice);
// router.post("/comment/:id", requireApproved, addComment);
// router.delete("/del-comment/:id/:commentId", deleteComment);

module.exports = router;
