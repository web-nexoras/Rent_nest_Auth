const express = require("express");
const router = express.Router();


const { signin } = require("../../controllers/auth/SignIn");

router.post('/signin', signin);

module.exports = router;