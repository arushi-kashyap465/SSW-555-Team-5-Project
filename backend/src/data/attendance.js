// backend/src/data/attendance.js
// Attendance records live in their own collection so duplicate-scan
// prevention is a single compound key read, and teacher reporting is
// a simple `where session_id == X` query.
//
// Shape:
// {
//   _id: docId,
//   session_id: string,
//   course_id: string,
//   student_id: string,
//   check_in_time: Date,
//   method: "qr" | "manual",
//   status: "present" | "late"
// }
import {
  attendanceCol,
  sessionsCol
} from "../config/firestoreCollections.js";
import { checkId } from "../helpers/validation.js";
import { getSessionById } from "./sessions.js";
import { getCourseById, getStudentsInCourse } from "./courses.js";
import { getUserById } from "./users.js";

const serialize = (id, data) => ({
  _id: id,
  session_id: data.session_id,
  course_id: data.course_id,
  student_id: data.student_id,
  check_in_time: data.check_in_time,
  method: data.method,
  status: data.status
});

/**
 * Record a student's attendance. Idempotent: duplicate scans return the
 * existing record instead of creating a second row.
 */
export const recordAttendance = async (session_id, student_id, method = "qr") => {
  session_id = checkId(session_id, "Session ID");
  student_id = checkId(student_id, "Student ID");

  // Ensure session and student both exist, and student is enrolled.
  const session = await getSessionById(session_id);
  const course = await getCourseById(session.course_id);

  if (!Array.isArray(course.students) || !course.students.includes(student_id)) {
    throw new Error("You are not enrolled in this course");
  }

  // Dedupe: one record per (session_id, student_id).
  const existing = await attendanceCol
    .where("session_id", "==", session_id)
    .where("student_id", "==", student_id)
    .limit(1)
    .get();

  if (!existing.empty) {
    const doc = existing.docs[0];
    return {
      record: serialize(doc.id, doc.data()),
      duplicate: true
    };
  }

  const now = new Date();
  // Compute late vs present if we can parse ends_at.
  let status = "present";
  try {
    const endsAt = new Date(session.ends_at);
    if (!isNaN(endsAt.getTime()) && now > endsAt) status = "late";
  } catch (_) {}

  const docRef = await attendanceCol.add({
    session_id,
    course_id: session.course_id,
    student_id,
    check_in_time: now,
    method,
    status
  });
  const saved = await docRef.get();

  return {
    record: serialize(saved.id, saved.data()),
    duplicate: false
  };
};

export const getAttendanceForSession = async (session_id) => {
  session_id = checkId(session_id, "Session ID");
  const snap = await attendanceCol.where("session_id", "==", session_id).get();
  return snap.docs.map((d) => serialize(d.id, d.data()));
};

/**
 * Teacher-facing report: merges the course roster with recorded attendance,
 * so every student appears exactly once with their status.
 */
export const getAttendanceReport = async (session_id) => {
  session_id = checkId(session_id, "Session ID");
  const session = await getSessionById(session_id);
  const studentIds = await getStudentsInCourse(session.course_id);

  const attendance = await getAttendanceForSession(session_id);
  const byStudent = new Map(attendance.map((r) => [r.student_id, r]));

  const rows = await Promise.all(
    studentIds.map(async (sid) => {
      let user;
      try {
        user = await getUserById(sid);
      } catch {
        user = { _id: sid, name: "(unknown)", email: "" };
      }
      const rec = byStudent.get(sid);
      return {
        student_id: sid,
        name: user.name,
        email: user.email,
        status: rec ? rec.status : "absent",
        check_in_time: rec ? rec.check_in_time : null,
        method: rec ? rec.method : null
      };
    })
  );

  return {
    session,
    roster: rows,
    summary: {
      total: rows.length,
      present: rows.filter((r) => r.status === "present").length,
      late: rows.filter((r) => r.status === "late").length,
      absent: rows.filter((r) => r.status === "absent").length
    }
  };
};

export const getAttendanceForStudent = async (student_id) => {
  student_id = checkId(student_id, "Student ID");
  const snap = await attendanceCol.where("student_id", "==", student_id).get();
  return snap.docs.map((d) => serialize(d.id, d.data()));
};
