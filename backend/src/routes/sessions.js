// backend/src/routes/sessions.js
import { Router } from "express";
import {
  createSession,
  getSessionById,
  getAllSessions,
  getSessionsByInstructor,
  getSessionQRImage,
  setSessionActive
} from "../data/sessions.js";
import { getAttendanceReport } from "../data/attendance.js";
import { loginRequired, requireRole } from "../middleware/middleware.js";

const router = Router();

// Teacher creates a session and immediately receives QR url + QR image data.
router.post("/", loginRequired, requireRole("instructor"), async (req, res) => {
  try {
    const { course_id, title, starts_at, ends_at, late_grace_minutes } =
      req.body || {};
    const hostingUrl =
      req.body?.hostingUrl ||
      process.env.HOSTING_URL ||
      `${req.protocol}://${req.get("host")}`;
    const session = await createSession(
      course_id,
      req.user._id,
      title,
      starts_at,
      ends_at,
      hostingUrl,
      late_grace_minutes
    );
    res.status(201).json(session);
  } catch (e) {
    res.status(400).json({ error: e.message || String(e) });
  }
});

// Only the logged-in instructor's own sessions — each teacher should only
// see their own attendance data in the viewer.
router.get("/", loginRequired, requireRole("instructor"), async (req, res) => {
  try {
    res.json(await getSessionsByInstructor(req.user._id));
  } catch (e) {
    res.status(500).json({ error: e.message || String(e) });
  }
});

// Admin-style full list if ever needed; left behind `/all` so the default
// scoped endpoint stays safe.
router.get(
  "/all",
  loginRequired,
  requireRole("instructor"),
  async (_req, res) => {
    try {
      res.json(await getAllSessions());
    } catch (e) {
      res.status(500).json({ error: e.message || String(e) });
    }
  }
);

router.get("/:id", loginRequired, async (req, res) => {
  try {
    res.json(await getSessionById(req.params.id));
  } catch (e) {
    res.status(404).json({ error: e.message || String(e) });
  }
});

// Regenerate / re-serve the QR image for a session (handy if the teacher
// loses the window without regenerating the token).
router.get(
  "/:id/qr",
  loginRequired,
  requireRole("instructor"),
  async (req, res) => {
    try {
      const { session, dataUrl } = await getSessionQRImage(req.params.id);
      res.json({ session, dataUrl });
    } catch (e) {
      res.status(404).json({ error: e.message || String(e) });
    }
  }
);

router.get(
  "/:id/attendance",
  loginRequired,
  requireRole("instructor"),
  async (req, res) => {
    try {
      const report = await getAttendanceReport(req.params.id);
      res.json(report);
    } catch (e) {
      res.status(404).json({ error: e.message || String(e) });
    }
  }
);

// Close / reopen a session (teacher only).
router.patch(
  "/:id/active",
  loginRequired,
  requireRole("instructor"),
  async (req, res) => {
    try {
      const session = await setSessionActive(req.params.id, !!req.body?.active);
      res.json(session);
    } catch (e) {
      res.status(400).json({ error: e.message || String(e) });
    }
  }
);

export default router;
