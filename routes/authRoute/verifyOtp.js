const express = require('express')
const router = express.Router()
const { verifyOtp } = require('../../controllers/auth/verifyOtp')


router.post('/verify-otp', verifyOtp);


module.exports = router
