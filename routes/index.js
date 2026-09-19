const express = require("express");
const router = express.Router();

const baseUrl = process.env.BASE_URL;
const authRoutes = require("./authRoute");

router.use(baseUrl, authRoutes);

module.exports = router;