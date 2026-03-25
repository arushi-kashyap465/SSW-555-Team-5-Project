import express from "express";
import {
  createEvent,
  getAllEvents,
  getEventAttendanceDetail,
  recordEventCheckIn,
} from "../data/events.js";

const router = express.Router();

router.get("/:id/attendance", async (req, res) => {
  try {
    const detail = await getEventAttendanceDetail(req.params.id);
    return res.json(detail);
  } catch (err) {
    const msg = err.message || String(err);
    if (msg.includes("not found") || msg.includes("Invalid")) {
      return res.status(404).json({ error: msg });
    }
    return res.status(400).json({ error: msg });
  }
});

router.post("/:id/check-in", async (req, res) => {
  try {
    const { userId, method } = req.body || {};
    const detail = await recordEventCheckIn(req.params.id, userId, method);
    return res.json(detail);
  } catch (err) {
    return res.status(400).json({ error: err.message || String(err) });
  }
});

router.get("/", async (req, res) => {
  try {
    const events = await getAllEvents();
    return res.json(events);
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) });
  }
});

router.post("/", async (req, res) => {
  const { title, details, startsAt, endsAt } = req.body || {};

  try {
    const event = await createEvent(title, details, { startsAt, endsAt });
    return res.status(201).json(event);
  } catch (err) {
    return res.status(400).json({ error: err.message || String(err) });
  }
});

export default router;
