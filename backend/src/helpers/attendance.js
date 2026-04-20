// backend/src/helpers/attendance.js
// Builds blank attendance record stubs keyed by Firestore user IDs.
// Used when a teacher creates a session so we have a full roster list
// and can later flip any student to "present".
export const buildBlankAttendanceRecords = (studentIds) => {
  if (!Array.isArray(studentIds)) {
    throw new Error("studentIds must be an array");
  }

  return studentIds.map((studentId) => ({
    student_id: String(studentId),
    status: "absent",
    check_in_time: null,
    method: null
  }));
};
