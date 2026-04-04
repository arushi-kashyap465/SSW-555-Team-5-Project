import { ObjectId } from "mongodb";

export const buildBlankAttendanceRecords = (studentIds) => {
  if (!Array.isArray(studentIds)) {
    throw new Error("studentIds must be an array");
  }

  return studentIds.map((studentId) => ({
    student_id: new ObjectId(studentId),
    status: null,
    check_in_time: null,
    method: null
  }));
};