const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const sequelize = require("./config/db");
const models = require("./models"); 
const path = require("path");

dotenv.config();

const helmet = require("helmet");

app.use(express.json());
app.use(cors());
app.use(helmet()); // Adds security headers (XSS, No-Sniff, etc.)

// Request Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, {
    body: req.body,
    headers: req.headers.authorization ? 'Present' : 'Missing'
  });
  next();
});

// تقديم ملفات الواجهة
const frontendPath = path.join(__dirname, "frontend");
// app.use(express.static(frontendPath));

// app.get("/", (req, res) => {
//   res.sendFile(path.join(frontendPath, "index.html"));
// });

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/products", require("./routes/products.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/users", require("./routes/users.routes"));
app.use("/api/brands", require("./routes/brand.routes"));
app.use("/api/categories", require("./routes/category.routes"));
app.use("/api/flash", require("./routes/flash.routes"));
app.use("/api/cart", require("./routes/cart.routes"));
app.use("/api/inbox", require("./routes/inbox.routes"));
app.use("/api/dashboard", require("./routes/dashboard.routes"));

sequelize
  .sync()
  .then(() => {
    console.log("Database Sync");
    app.listen(process.env.PORT || 3000, () => {
      console.log(`server running on port ${process.env.PORT || 3000}`);
    });
  })
  .catch((err) => {
    console.log("DB Error:", err);
  });
