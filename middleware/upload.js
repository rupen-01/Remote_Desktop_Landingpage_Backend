const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "video/mp4",
    "video/webm",
    "video/mkv",
    "video/avi",
  ];

  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only images or videos allowed"), false);
};

module.exports = multer({ storage, fileFilter });
