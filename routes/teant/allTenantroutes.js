const express = require("express");
const router = express.Router();

// ----------controllers
const { getPendingUsers } = require("../../controllers/teant/getPendingUsers");
const { getAllTenants } = require("../../controllers/teant/getAllTenants");
const { updateApprovalStatus } = require("../../controllers/teant/updateApprovalStatus");
const { removeTenant } = require("../../controllers/teant/removeTenant");


// ----------middlewares
const { adminOnly } = require("../../middlewares/adminOnly");

router.get("/pending", adminOnly, getPendingUsers);
router.get("/tenants", adminOnly, getAllTenants);
router.patch("/:id/approval", adminOnly, updateApprovalStatus);
router.delete("/:id", adminOnly, removeTenant);

module.exports = router;