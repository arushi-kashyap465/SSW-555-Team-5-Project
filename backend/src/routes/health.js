// backend/src/routes/health.js
import express from "express";
import { generateTestQRCode } from "../helpers/qr-generation.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  res.json({ status: "OK", message: "Server is healthy" });
});

router.get("/qr", async (_req, res) => {
  try {
    const qr = await generateTestQRCode();
    res.json({ qr });
  } catch (e) {
    res.status(500).json({ error: "Failed to generate QR code" });
  }
});

export default router;
