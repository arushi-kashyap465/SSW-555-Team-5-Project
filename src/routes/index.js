import courseRoutes from "./courses.js";
import sessionRoutes from "./sessions.js";
import userRoutes from "./users.js";
import healthRoutes from "./health.js";

export default function constructorMethod(app) {
  app.use("/courses", courseRoutes);
  app.use("/sessions", sessionRoutes);
  app.use("/users", userRoutes);
  app.use("/health", healthRoutes);

  app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});
}