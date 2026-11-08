const express = require("express");
const router = express.Router();
const { imageUpload } = require("../../helpers/upload");

// -------controlllers
const { createUnit } = require("../../controllers/dashboard/admin/units/createUnit");
const { getAllUnits } = require("../../controllers/dashboard/admin/units/getAllUnits");
const { getSingleUnit } = require("../../controllers/unit/getSingleUnit");
const { deleteUnit } = require("../../controllers/dashboard/admin/units/deleteUnit");
const { updateUnit } = require("../../controllers/dashboard/admin/units/updateUnit");
const { assignTenant } = require("../../controllers/dashboard/admin/units/assignTenant");
const { unassignTenant } = require("../../controllers/dashboard/admin/units/unassignTenant");
const { getMyUnit } = require("../../controllers/dashboard/tenant/units/getMyUnit");

// --------middleweres
const { adminOnly } = require("../../middlewares/adminOnly");
const { requireApproved } = require("../../middlewares/requireApproved");

router.post("/create", adminOnly, imageUpload.array("images", 3), createUnit);
router.get("/all-unit", adminOnly, getAllUnits);
router.get("/my-unit", requireApproved, getMyUnit);
router.get("/single-unit/:id", requireApproved, getSingleUnit);
router.delete("/del-unit/:id", adminOnly, deleteUnit);
router.patch("/update-unit/:id", adminOnly, imageUpload.array("images", 3), updateUnit);
router.patch("/assign-tenant/:id", adminOnly, assignTenant);
router.patch("/unassign-tenant/:id", adminOnly, unassignTenant);

module.exports = router;
