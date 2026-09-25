const express = require("express");
const router = express.Router();


const { forgotPassword } = require("../../controllers/auth/forgetPass");

router.post('/forget-password', forgotPassword);

module.exports = router;
