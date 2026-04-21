// backend/src/routes/scan.js
// Student-facing scan endpoint — called by /scan.html after the student
// has logged in. Requires a student JWT + the session token from the QR URL.
import { Router } from "express";
import { validateSessionToken } from "../data/sessions.js";
import { recordAttendance } from "../data/attendance.js";
import { loginRequired, requireRole } from "../middleware/middleware.js";

const router = Router();

router.post(
  "/:sessionId",
  loginRequired,
  requireRole("student"),
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { token } = req.body || {};
      const session = await validateSessionToken(sessionId, token);
      const { record, duplicate } = await recordAttendance(
        session._id,
        req.user._id,
        "qr"
      );
      res.status(duplicate ? 200 : 201).json({
        ok: true,
        duplicate,
        record,
        session: {
          _id: session._id,
          title: session.title,
          course_id: session.course_id
        }
      });
    } catch (e) {
      res.status(400).json({ ok: false, error: e.message || String(e) });
    }
  }
);

export default router;
