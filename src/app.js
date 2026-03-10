import dotenv from "dotenv";
import express from "express";
import cors from "cors";

import healthRoutes from "./routes/health.js";
import usersRoutes from "./routes/users.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve minimal frontend for manual testing
app.use(express.static("frontend"));

app.use("/api/health", healthRoutes);
app.use("/api", usersRoutes);

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});