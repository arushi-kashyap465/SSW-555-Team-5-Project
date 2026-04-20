// backend/src/routes/index.js
import usersRoutes from "./users.js";
import eventsRoutes from "./events.js";
import coursesRoutes from "./courses.js";
import sessionsRoutes from "./sessions.js";
import scanRoutes from "./scan.js";
import healthRoutes from "./health.js";

export default function registerRoutes(app) {
  app.use("/api/health", healthRoutes);
  app.use("/api", usersRoutes);
  app.use("/api", eventsRoutes);
  app.use("/api/courses", coursesRoutes);
  app.use("/api/sessions", sessionsRoutes);
  app.use("/api/scan", scanRoutes);

  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Not found" });
  });
}
