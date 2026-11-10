const express = require("express");
const router = express.Router();
const { imageUpload } = require("../../helpers/upload");

// -------controllers
const { createUnit } = require("../../controllers/dashboard/admin/units/createUnit");
const { getAllUnits } = require("../../controllers/dashboard/admin/units/getAllUnits");
const { getSingleUnit } = require("../../controllers/unit/getSingleUnit");
const { deleteUnit } = require("../../controllers/dashboard/admin/units/deleteUnit");
const { updateUnit } = require("../../controllers/dashboard/admin/units/updateUnit");
const { assignTenant } = require("../../controllers/dashboard/admin/units/assignTenant");
const { unassignTenant } = require("../../controllers/dashboard/admin/units/unassignTenant");
const { seedBuildingUnits } = require("../../controllers/dashboard/admin/units/seedBuildingUnits");
const { getUnitStatusMatrix } = require("../../controllers/dashboard/admin/units/getUnitStatusMatrix");
const { getMyUnit } = require("../../controllers/dashboard/tenant/units/getMyUnit");

// --------middlewares
const { adminOnly } = require("../../middlewares/adminOnly");
const { requireApproved } = require("../../middlewares/requireApproved");
const { cacheGet, clearCacheOnSuccess } = require("../../middlewares/redisCache");

const clearUnitCache = clearCacheOnSuccess("admin", "units", "tenants", "payments", "tenant");

router.post("/create", adminOnly, clearUnitCache, imageUpload.array("images", 3), createUnit);
router.post("/seed-building", adminOnly, clearUnitCache, seedBuildingUnits);
router.get("/all-unit", adminOnly, cacheGet("units", 25), getAllUnits);
router.get("/status-matrix", adminOnly, cacheGet("units", 20), getUnitStatusMatrix);
router.get("/my-unit", requireApproved, cacheGet("tenant", 20), getMyUnit);
router.get("/single-unit/:id", requireApproved, cacheGet("units", 25), getSingleUnit);
router.delete("/del-unit/:id", adminOnly, clearUnitCache, deleteUnit);
router.patch("/update-unit/:id", adminOnly, clearUnitCache, imageUpload.array("images", 3), updateUnit);
router.patch("/assign-tenant/:id", adminOnly, clearUnitCache, assignTenant);
router.patch("/unassign-tenant/:id", adminOnly, clearUnitCache, unassignTenant);

module.exports = router;
