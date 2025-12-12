const path = require("path");
const fs = require("fs");
const Banner = require("../models/Ad");

exports.createOrUpdateBanner = async (req, res) => {
  try {
    const { title, redirectLink } = req.body;

    let banner = await Banner.findOne({ title });

    const baseUrl = process.env.BASE_URL || "http://localhost:5000";

    let uploadedFilePath = req.file
      ? `${baseUrl}/uploads/banners/${req.file.filename}`
      : null;

    if (banner) {
      // Delete old file if new uploaded
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

          if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
        }
      }

      // Update with new uploaded file
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

    // Create new banner
    const newBanner = await Banner.create({
      title,
      image: req.file && req.file.mimetype.startsWith("image") ? uploadedFilePath : null,
      videoUrl: req.file && req.file.mimetype.startsWith("video") ? uploadedFilePath : null,
      redirectLink
    });

    res.status(201).json({ message: "Banner Created", banner: newBanner });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ========== Get Banners ==========
exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true });

    res.json(
      banners.map(b => ({
        ...b._doc,
        image: b.image || null,
        videoUrl: b.videoUrl || null
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteBanner = async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  res.json({ message: "Banner Deleted" });
};
