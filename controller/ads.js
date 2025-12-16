const path = require("path");
const fs = require("fs");
const Banner = require("../models/Ad");

// ================= CREATE / UPDATE =================
const createOrUpdateBanner = async (req, res) => {
  try {
    const { title, redirectLink } = req.body;

    let banner = await Banner.findOne({ title });

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const uploadedFilePath = req.file
      ? `${baseUrl}/uploads/banners/${req.file.filename}`
      : null;

    if (banner) {
      if (uploadedFilePath && (banner.image || banner.videoUrl)) {
        const oldFile = banner.image || banner.videoUrl;
        const oldPath = path.join(
          __dirname,
          "..",
          "uploads",
          "banners",
          path.basename(oldFile)
        );
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      if (uploadedFilePath) {
        if (req.file.mimetype.startsWith("image")) {
          banner.image = uploadedFilePath;
          banner.videoUrl = null;
        } else {
          banner.videoUrl = uploadedFilePath;
          banner.image = null;
        }
      }

      banner.redirectLink = redirectLink || banner.redirectLink;
      await banner.save();

      return res.json({ message: "Banner Updated", banner });
    }

    const newBanner = await Banner.create({
      title,
      image: req.file?.mimetype.startsWith("image") ? uploadedFilePath : null,
      videoUrl: req.file?.mimetype.startsWith("video") ? uploadedFilePath : null,
      redirectLink,
    });

    res.status(201).json({ message: "Banner Created", banner: newBanner });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= GET =================
const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= DELETE =================
const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    const file = banner.image || banner.videoUrl;
    if (file) {
      const filePath = path.join(
        __dirname,
        "..",
        "uploads",
        "banners",
        path.basename(file)
      );
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await banner.deleteOne();
    res.json({ message: "Banner Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔥 VERY IMPORTANT EXPORT
module.exports = {
  createOrUpdateBanner,
  getBanners,
  deleteBanner,
};
