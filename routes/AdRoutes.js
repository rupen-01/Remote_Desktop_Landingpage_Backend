const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  createOrUpdateBanner,
  getBanners,
  deleteBanner,
} = require("../controller/ads");

router.post("/create", upload.single("file"), createOrUpdateBanner);
router.get("/", getBanners);
router.delete("/:id", deleteBanner);

module.exports = router;
