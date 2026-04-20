// backend/src/routes/events.js
import express from "express";
import { createEvent, getAllEvents } from "../data/events.js";

const router = express.Router();

router.post("/events", async (req, res) => {
  const { title, details } = req.body || {};
  try {
    const event = await createEvent(title, details);
    return res.status(201).json(event);
  } catch (err) {
    return res.status(400).json({ error: err.message || String(err) });
  }
});

router.get("/events", async (_req, res) => {
  try {
    const events = await getAllEvents();
    return res.json(events);
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) });
  }
});

export default router;
