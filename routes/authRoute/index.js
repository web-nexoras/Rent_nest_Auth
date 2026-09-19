const express = require("express");
const router = express.Router();

const Signup = require ('./signUp.js')
const VerifyOtp = require ('./verifyOtp.js')
const Signin = require ('./signIn.js')
const forget = require ('./forgetPass.js')
const resetPass = require ('./restetPass.js')
const logOut = require ('./logOut.js')
const getProfile = require ('./getProfile.js')
const updateProfile = require ('./updateProfile.js')

router.use("/auth", Signup );
router.use("/auth", VerifyOtp );
router.use("/auth", Signin );
router.use("/auth", forget );
router.use("/auth", resetPass );
router.use("/auth", logOut );
router.use("/auth", getProfile );
router.use("/auth", updateProfile );

module.exports = router;
