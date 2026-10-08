const express = require("express");
const router = express.Router();

// ----------controllers
const { getPendingUsers } = require("../../controllers/admin/getPendingUsers");
const { getAllTenants } = require("../../controllers/admin/getAllTenants");
const { updateApprovalStatus } = require("../../controllers/admin/updateApprovalStatus");
const { removeTenant } = require("../../controllers/admin/removeTenant");
const { toggleTenantActive } = require("../../controllers/admin/toggleTenantActive");


// ----------middlewares
const { adminOnly } = require("../../middlewares/adminOnly");

router.get("/pending", adminOnly, getPendingUsers);
router.get("/tenants", adminOnly, getAllTenants);
router.patch("/:id/approval", adminOnly, updateApprovalStatus);
router.delete("/:id", adminOnly, removeTenant);
router.patch("/:id/active", adminOnly, toggleTenantActive);


module.exports = router;