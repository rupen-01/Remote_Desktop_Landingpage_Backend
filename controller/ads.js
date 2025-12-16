const path = require("path");
const fs = require("fs");
const Banner = require("../models/Ad");

exports.createOrUpdateBanner = async (req, res) => {
  try {
    const { title, redirectLink } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // 🔍 find banner by title (banner1 / banner2)
    let banner = await Banner.findOne({ title });

    // 🔥 AUTO BASE URL (LOCAL + LIVE)
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // 📁 new uploaded file path
    const uploadedFilePath = req.file
      ? `${baseUrl}/uploads/banners/${req.file.filename}`
      : null;

    // ================= UPDATE =================
    if (banner) {
      // 🧹 DELETE OLD FILE IF NEW FILE UPLOADED
      if (uploadedFilePath && (banner.image || banner.videoUrl)) {
        const oldFileUrl = banner.image || banner.videoUrl;
        const oldFileName = path.basename(oldFileUrl);

        const oldFilePath = path.join(
          __dirname,
          "..",
          "uploads",
          "banners",
          oldFileName
        );

        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      // 🔄 SAVE NEW FILE
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

      return res.json({
        message: "Banner Updated (Old file deleted)",
        banner
      });
    }

    // ================= CREATE =================
    const newBanner = await Banner.create({
      title,
      image: req.file?.mimetype.startsWith("image") ? uploadedFilePath : null,
      videoUrl: req.file?.mimetype.startsWith("video") ? uploadedFilePath : null,
      redirectLink
    });

    res.status(201).json({
      message: "Banner Created",
      banner: newBanner
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
