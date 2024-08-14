const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const adminRoutes = require("./routes/adminRoutes");
const brandRoutes = require("./routes/brandRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const orderRoutes = require("./routes/orderRoutes");
const path = require("path");
const Visitor = require("./models/visitorModel");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(bodyParser.json());
// app.use(express.json());
app.use("/public", express.static(path.join(__dirname, "uploads")));

// Route-lar
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/visitors/daily", async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const count = await Visitor.countDocuments({
      visitDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    res.json({ dailyVisitors: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.use(express.static(path.join(__dirname, "public")));
app.get("/api", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
