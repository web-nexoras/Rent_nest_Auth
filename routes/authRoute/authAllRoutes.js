const express = require("express");
const router = express.Router();
const { imageUpload } = require("../../helpers/upload");
const { authLimiter } = require("../../middlewares/rateLimit");

// ---------controllers 
const { signup } = require("../../controllers/auth/signUp");
const { verifyOtp } = require("../../controllers/auth/verifyOtp");
const { resendOtp } = require("../../controllers/auth/resendOtp");
const { signin } = require("../../controllers/auth/SignIn");
const { forgotPassword } = require("../../controllers/auth/forgetPass");
const { resetPassword } = require("../../controllers/auth/resetPass");
const { logOut } = require("../../controllers/auth/logOut");
const { refreshToken } = require("../../controllers/auth/refreshToken");


// ------------profile
const { getProfile } = require("../../controllers/auth/gerProfile");
const { updateProfile } = require("../../controllers/auth/updateProfile");

// -----------middlewere
const { authMiddleware } = require("../../middlewares/authMiddleware");


router.post("/signup", authLimiter, signup);
router.post("/verify-otp", authLimiter, verifyOtp);
router.post("/resend-otp", authLimiter, resendOtp);
router.post("/signin", authLimiter, signin);
router.post("/forget-password", authLimiter, forgotPassword);
router.patch("/reset-password/:token", authLimiter, resetPassword);
router.post("/refresh-token", refreshToken);
router.post("/log-out", authMiddleware, logOut);

router.get("/get-profile", authMiddleware, getProfile);
router.put(
  "/update-profile",
  authMiddleware,
  imageUpload.single("profileImage"),
  updateProfile,
);



module.exports = router;
