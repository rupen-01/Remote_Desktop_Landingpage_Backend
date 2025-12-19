const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      enum: ["banner1", "banner2"],
      required: true,
      unique: true,
    },

    image: String,
    videoUrl: String,

    cloudinaryId: String, // 🔥 IMPORTANT

    redirectLink: String,

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Banner", bannerSchema);
