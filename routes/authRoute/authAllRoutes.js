const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();

// ---------controllers 
const { signup } = require("../../controllers/auth/signUp");
const { verifyOtp } = require("../../controllers/auth/verifyOtp");
const { resendOtp } = require("../../controllers/auth/resendOtp");
const { signin } = require("../../controllers/auth/SignIn");
const { forgotPassword } = require("../../controllers/auth/forgetPass");
const { resetPassword } = require("../../controllers/auth/resetPass");
const { logOut } = require("../../controllers/auth/logOut");


// ------------profile
const { getProfile } = require("../../controllers/auth/gerProfile");
const { updateProfile } = require("../../controllers/auth/updateProfile");

// -----------middlewere
const { authMiddleware } = require("../../middlewares/authMiddleware");


router.post("/signup", signup);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/signin', signin);
router.post('/forget-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);
router.post('/log-out', authMiddleware ,logOut);

router.get('/get-profile', authMiddleware , getProfile );
router.put("/update-profile", authMiddleware, upload.single("profileImage"), updateProfile);



module.exports = router;
