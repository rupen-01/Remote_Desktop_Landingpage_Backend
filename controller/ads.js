const path = require("path");
const fs = require("fs");
const Banner = require("../models/Ad");

exports.createOrUpdateBanner = async (req, res) => {
  try {
    const { title, redirectLink } = req.body;

    let banner = await Banner.findOne({ title });

    // 🔥 AUTO URL (LOCAL + LIVE)
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const uploadedFilePath = req.file
      ? `${baseUrl}/uploads/banners/${req.file.filename}`
      : null;

    // ===== UPDATE =====
    if (banner) {
      if (uploadedFilePath) {
        const oldFile = banner.image || banner.videoUrl;

        if (oldFile) {
          const oldFilePath = path.join(
            __dirname,
            "..",
            "uploads",
            "banners",
            path.basename(oldFile)
          );

          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
      }

      if (uploadedFilePath) {
        if (req.file.mimetype.startsWith("image")) {
          banner.image = uploadedFilePath;
          banner.videoUrl = null;
        } else if (req.file.mimetype.startsWith("video")) {
          banner.videoUrl = uploadedFilePath;
          banner.image = null;
        }
      }

      banner.redirectLink = redirectLink || banner.redirectLink;
      await banner.save();

      return res.json({ message: "Banner Updated", banner });
    }

    // ===== CREATE =====
    const newBanner = await Banner.create({
      title,
      image: req.file?.mimetype.startsWith("image") ? uploadedFilePath : null,
      videoUrl: req.file?.mimetype.startsWith("video") ? uploadedFilePath : null,
      redirectLink
    });

    res.status(201).json({ message: "Banner Created", banner: newBanner });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ========= GET =========
exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ========= DELETE =========
exports.deleteBanner = async (req, res) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) return res.status(404).json({ message: "Not found" });

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
};
