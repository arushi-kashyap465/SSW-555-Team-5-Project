// backend/src/data/sessions.js
// Firestore-backed class sessions.
//
// Shape:
// {
//   _id: docId,
//   course_id: string,
//   created_by: instructorId,
//   title: string,
//   starts_at: ISO string,
//   ends_at: ISO string,
//   token: string,              // plaintext short-lived QR token
//   qrUrl: string,              // the URL the QR image encodes
//   active: boolean,
//   late_grace_minutes: number, // minutes after starts_at before "late"
//   createdAt: Date
// }
//
// Grace-period rules:
//   - Default 10 minutes if the caller omits it.
//   - Clamped to 0..180 so a stray huge value can't make the session
//     effectively never-late, and a negative value can't flip the logic.
import bcrypt from "bcrypt";
import { sessionsCol } from "../config/firestoreCollections.js";
import { getCourseById } from "./courses.js";
import {
  checkId,
  checkString
} from "../helpers/validation.js";
import {
  generateSessionToken,
  generateQRCode
} from "../helpers/qr-generation.js";

const DEFAULT_LATE_GRACE_MINUTES = 10;
const MAX_LATE_GRACE_MINUTES = 180;

const normalizeGrace = (v) => {
  if (v === undefined || v === null || v === "") return DEFAULT_LATE_GRACE_MINUTES;
  const n = Number(v);
  if (!Number.isFinite(n)) {
    throw new Error("Late grace minutes must be a number");
  }
  if (n < 0) throw new Error("Late grace minutes cannot be negative");
  if (n > MAX_LATE_GRACE_MINUTES) {
    throw new Error(`Late grace minutes cannot exceed ${MAX_LATE_GRACE_MINUTES}`);
  }
  return Math.round(n);
};

const serialize = (id, data) => ({
  _id: id,
  course_id: data.course_id,
  created_by: data.created_by,
  title: data.title,
  starts_at: data.starts_at,
  ends_at: data.ends_at,
  token: data.token,
  qrUrl: data.qrUrl,
  active: !!data.active,
  late_grace_minutes: Number.isFinite(data.late_grace_minutes)
    ? data.late_grace_minutes
    : DEFAULT_LATE_GRACE_MINUTES,
  createdAt: data.createdAt
});

export const createSession = async (
  course_id,
  created_by,
  title,
  starts_at,
  ends_at,
  hostingUrl,
  late_grace_minutes
) => {
  course_id = checkId(course_id, "Course ID");
  created_by = checkId(created_by, "Instructor ID");
  title = checkString(title, "Session Title");
  starts_at = checkString(starts_at, "Session Start Time");
  ends_at = checkString(ends_at, "Session End Time");
  const grace = normalizeGrace(late_grace_minutes);

  // Verify the course exists and the caller is its instructor.
  const course = await getCourseById(course_id);
  if (course.instructor !== created_by) {
    throw new Error("Only the course instructor may create sessions for it");
  }

  const token = generateSessionToken();
  const now = new Date();

  // Build a placeholder doc first so we have an id to embed in the QR URL.
  const ref = await sessionsCol.add({
    course_id,
    created_by,
    title,
    starts_at,
    ends_at,
    token,
    qrUrl: null,
    active: true,
    late_grace_minutes: grace,
    createdAt: now
  });

  const { url, dataUrl } = await generateQRCode(ref.id, token, hostingUrl);
  await ref.update({ qrUrl: url });

  const saved = await ref.get();
  return {
    ...serialize(saved.id, saved.data()),
    qrDataUrl: dataUrl
  };
};

export const getSessionById = async (id) => {
  id = checkId(id, "Session ID");
  const doc = await sessionsCol.doc(id).get();
  if (!doc.exists) throw new Error("Session not found!");
  return serialize(doc.id, doc.data());
};

export const getAllSessions = async () => {
  const snap = await sessionsCol.orderBy("createdAt", "desc").get();
  return snap.docs.map((d) => serialize(d.id, d.data()));
};

// Sorted newest-first in memory so we don't need a composite Firestore index
// on (created_by, createdAt). The result set per instructor stays small.
export const getSessionsByInstructor = async (instructorId) => {
  instructorId = checkId(instructorId, "Instructor ID");
  const snap = await sessionsCol
    .where("created_by", "==", instructorId)
    .get();
  const rows = snap.docs.map((d) => serialize(d.id, d.data()));
  rows.sort((a, b) => {
    const ta = a.createdAt?.toMillis
      ? a.createdAt.toMillis()
      : new Date(a.createdAt || 0).getTime();
    const tb = b.createdAt?.toMillis
      ? b.createdAt.toMillis()
      : new Date(b.createdAt || 0).getTime();
    return tb - ta;
  });
  return rows;
};

export const getSessionQRImage = async (id) => {
  const session = await getSessionById(id);
  const { dataUrl } = await generateQRCode(session._id, session.token);
  return { session, dataUrl };
};

export const setSessionActive = async (id, active) => {
  id = checkId(id, "Session ID");
  const ref = sessionsCol.doc(id);
  const doc = await ref.get();
  if (!doc.exists) throw new Error("Session not found!");
  await ref.update({ active: !!active });
  const updated = await ref.get();
  return serialize(updated.id, updated.data());
};

// Used by the scan flow: validates token constant-time.
export const validateSessionToken = async (sessionId, suppliedToken) => {
  const session = await getSessionById(sessionId);
  if (!session.active) throw new Error("Session is no longer active");
  // constant-time-ish comparison
  const a = Buffer.from(String(session.token));
  const b = Buffer.from(String(suppliedToken || ""));
  if (a.length !== b.length) throw new Error("Invalid session token");
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  if (diff !== 0) throw new Error("Invalid session token");
  return session;
};
