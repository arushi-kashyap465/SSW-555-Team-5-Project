const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/health");
const usersRoutes = require("./routes/users");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api", usersRoutes);

module.exports = app;
