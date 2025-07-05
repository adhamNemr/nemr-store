const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const sequelize = require("./config/db")
const path = require("path");

dotenv.config();

app.use(express.json());
app.use(cors());

// تقديم ملفات الواجهة
const frontendPath = path.join(__dirname, "frontend");
app.use(express.static(frontendPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/products", require("./routes/products.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/users", require("./routes/users.routes"));


sequelize.sync().then(() => {
    console.log("Database Sync")
    app.listen(process.env.port || 3000 , () =>{
        console.log(`server running on port ${process.env.port || 3000}`);
    });
}).catch((err) => {
    console.log("DB Erorr : ", err.message)
});
