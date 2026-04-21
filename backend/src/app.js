// backend/src/app.js
// Builds (but does not start) the Express app so the same instance can be
// mounted by src/server.js for local dev and by ../index.js for Firebase Functions.
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import registerRoutes from "./routes/index.js";
import { requestLogger } from "./middleware/middleware.js";

dotenv.config();

export function buildApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(requestLogger);

  registerRoutes(app);

  // Generic error fallthrough
  app.use((err, _req, res, _next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  });

  return app;
}

export default buildApp;
