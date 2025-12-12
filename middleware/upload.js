const multer = require("multer");
const path = require("path");

// Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/banners");
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + path.extname(file.originalname);
    cb(null, unique);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "video/mp4",
    "video/webm",
    "video/mkv",
    "video/avi"
  ];

  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only images or videos allowed"), false);
};

module.exports = multer({ storage, fileFilter });
