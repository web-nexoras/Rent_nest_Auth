const multer = require("multer");

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 3,
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.has(file.mimetype)) {
      const error = new Error("Only JPEG, PNG, and WEBP images are allowed");
      error.statusCode = 400;
      return cb(error);
    }
    cb(null, true);
  },
});

module.exports = { imageUpload };
