import dotenv from "dotenv";
import express from "express";
import cors from "cors";

import healthRoutes from "./routes/health.js";
import usersRoutes from "./routes/users.js";
import eventsRoutes from "./routes/events.js";
import sessionsRoutes from "./routes/sessions.js";
import courseRoutes from "./routes/courses.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api", usersRoutes);
app.use("/api", sessionsRoutes);
app.use("/api/courses", courseRoutes);

app.use(express.static("frontend"));

app.listen(PORT, () => {
  console.log(`Backend running on port http://localhost:${PORT}`);
});