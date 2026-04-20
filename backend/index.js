// backend/index.js
// Firebase Cloud Functions entry point. Exports the Express app as a single
// HTTPS function `api`. Hosting rewrites forward /api/** here so the same
// routes that ran locally at http://localhost:3001/api/... work unchanged.
import { onRequest } from "firebase-functions/v2/https";
import { buildApp } from "./src/app.js";

const app = buildApp();

export const api = onRequest(
  { region: "us-central1", memory: "512MiB", timeoutSeconds: 60 },
  app
);
