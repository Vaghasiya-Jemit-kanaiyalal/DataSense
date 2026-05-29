const express = require("express");
const cors = require("cors");

require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const dataRoutes = require("./routes/dataRoutes");
const datasetService = require("./services/dataset.service");
require("./config/db.js"); // Initialize database connection

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/data", dataRoutes);


app.get("/", (req, res) => {
    res.send("DataSense Backend Running...");
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await datasetService.ensureTables();
    console.log("Database schema ready");
  } catch (err) {
    console.error("Database migration failed:", err.message);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();