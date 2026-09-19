const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../../middlewares/authMiddleware");
const { getProfile } = require("../../controllers/auth/gerProfile");


router.get('/get-profile', authMiddleware , getProfile );

module.exports = router;