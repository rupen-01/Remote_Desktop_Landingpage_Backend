const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, // hashed
}, { timestamps: true });

module.exports = mongoose.model("Admin", AdminSchema);
