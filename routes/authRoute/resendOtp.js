const express = require("express");
const router = express.Router();

const { resendOtp } = require("../../controllers/auth/resendOtp");

router.post('/resend-otp', resendOtp);

module.exports = router;