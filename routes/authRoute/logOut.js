const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../../middlewares/authMiddleware");
const { logOut } = require("../../controllers/auth/logOut");


router.post('/log-out', authMiddleware ,logOut);

module.exports = router;