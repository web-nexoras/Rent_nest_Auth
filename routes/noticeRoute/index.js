const express = require("express");
const router = express.Router();

const getallNotice = require ('./getallNotice.js')
const getNotice = require ('./getSingleNotice.js')
// const resendOtp = require ('./resendOtp.js')
// const Signin = require ('./signIn.js')
// const forget = require ('./forgetPass.js')
// const resetPass = require ('./restetPass.js')
// const logOut = require ('./logOut.js')
// const getProfile = require ('./getProfile.js')
// const updateProfile = require ('./updateProfile.js')

router.use("/notice", getallNotice );
router.use("/notice", getNotice );


module.exports = router;
