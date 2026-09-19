const express = require("express");
const router = express.Router();

const { resetPassword } = require("../../controllers/auth/resetPass");


router.patch('/reset-password/:token', resetPassword);

module.exports = router;