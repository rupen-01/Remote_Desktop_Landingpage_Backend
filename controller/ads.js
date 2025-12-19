const Banner = require("../models/Ad");
const cloudinary = require("../config/cloudinary");

// ===== helper =====
const uploadToCloudinary = (file) => {
  const resourceType = file.mimetype.startsWith("video")
    ? "video"
    : "image";

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "banners",
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(file.buffer);
  });
};

// ================= CREATE / UPDATE =================
const createOrUpdateBanner = async (req, res) => {
  try {
    const { title, redirectLink } = req.body;

    let banner = await Banner.findOne({ title });
    let uploadResult = null;

    if (req.file) {
      uploadResult = await uploadToCloudinary(req.file);
    }

    // ===== UPDATE =====
    if (banner) {
      // 🔥 DELETE OLD MEDIA (CORRECT WAY)
      if (uploadResult && banner.cloudinaryId) {
        const oldResourceType = banner.videoUrl ? "video" : "image";

        await cloudinary.uploader.destroy(banner.cloudinaryId, {
          resource_type: oldResourceType,
        });
      }

      // 🔥 SAVE NEW MEDIA
      if (uploadResult) {
        if (req.file.mimetype.startsWith("image")) {
          banner.image = uploadResult.secure_url;
          banner.videoUrl = null;
        } else {
          banner.videoUrl = uploadResult.secure_url;
          banner.image = null;
        }

        banner.cloudinaryId = uploadResult.public_id;
      }

      banner.redirectLink = redirectLink || banner.redirectLink;
      await banner.save();

      return res.json({ message: "Banner Updated", banner });
    }

    // ===== CREATE =====
    const newBanner = await Banner.create({
      title,
      image: req.file?.mimetype.startsWith("image")
        ? uploadResult?.secure_url
        : null,
      videoUrl: req.file?.mimetype.startsWith("video")
        ? uploadResult?.secure_url
        : null,
      cloudinaryId: uploadResult?.public_id,
      redirectLink,
    });

    res.status(201).json({ message: "Banner Created", banner: newBanner });

  } catch (err) {
    console.error("Banner Error:", err);
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

    // 🔥 DELETE FROM CLOUDINARY (FIXED)
    if (banner.cloudinaryId) {
      const resourceType = banner.videoUrl ? "video" : "image";

      await cloudinary.uploader.destroy(banner.cloudinaryId, {
        resource_type: resourceType,
      });
    }

    await banner.deleteOne();
    res.json({ message: "Banner Deleted" });

  } catch (err) {
    console.error("Delete Banner Error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createOrUpdateBanner,
  getBanners,
  deleteBanner,
};
