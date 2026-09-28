const express = require("express");
const router = express.Router();

const allRoutes = require("./authAllRoutes.js");

router.use("/auth", allRoutes);

module.exports = router;
