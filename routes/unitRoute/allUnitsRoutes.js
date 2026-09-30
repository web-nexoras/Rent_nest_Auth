const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();

// -------controlllers
const { createUnit } = require("../../controllers/unit/createUnit");
const { getAllUnits } = require("../../controllers/unit/getAllUnits");
const { getSingleUnit } = require("../../controllers/unit/getSingleUnit");
const { deleteUnit } = require("../../controllers/unit/deleteUnit");
const { updateUnit } = require("../../controllers/unit/updateUnit");
const { assignTenant } = require("../../controllers/unit/assignTenant");
const { unassignTenant } = require("../../controllers/unit/unassignTenant");

// --------middleweres
const { adminOnly } = require("../../middlewares/adminOnly");
const { requireApproved } = require("../../middlewares/requireApproved");

router.post("/create", adminOnly,upload.array("images", 3),createUnit,);
router.get("/all-unit", adminOnly, getAllUnits);
router.get("/single-unit/:id", requireApproved, getSingleUnit);
router.delete("/del-unit/:id", adminOnly, deleteUnit);
router.patch("/update-unit/:id", adminOnly, updateUnit);
router.patch("/assign-tenant/:id", adminOnly, assignTenant);
router.patch("/unassign-tenant/:id", adminOnly, unassignTenant);

module.exports = router;
