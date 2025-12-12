require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// static folder for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log("Mongo connected..."))
.catch(err => console.error(err));

// routes
// const adminRoutes = require("./routes/admin");
const adRoutes = require("./routes/AdRoutes");

// app.use("/api/admin", adminRoutes);
app.use("/api/ads", adRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`Server started on ${PORT}`));
