const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      enum: ["banner1", "banner2"],
      required: true,
    },

    image: String,
    videoUrl: String,

    redirectLink: {
      type: String,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Banner", bannerSchema);
