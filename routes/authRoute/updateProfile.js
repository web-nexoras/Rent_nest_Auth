const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();

const { authMiddleware } = require("../../middlewares/authMiddleware");
const { updateProfile } = require("../../controllers/auth/updateProfile");

router.put("/update-profile", authMiddleware, upload.single("avatar"), updateProfile);

module.exports = router;