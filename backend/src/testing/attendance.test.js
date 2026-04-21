// backend/src/testing/attendance.test.js
import { buildBlankAttendanceRecords } from "../helpers/attendance.js";

describe("buildBlankAttendanceRecords", () => {
  test("creates one blank attendance record per student id", () => {
    const studentIds = ["stu_abc", "stu_def"];
    const result = buildBlankAttendanceRecords(studentIds);

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);

    result.forEach((record, i) => {
      expect(record.student_id).toBe(studentIds[i]);
      expect(record.status).toBe("absent");
      expect(record.check_in_time).toBeNull();
      expect(record.method).toBeNull();
    });
  });

  test("empty array input", () => {
    expect(buildBlankAttendanceRecords([])).toEqual([]);
  });

  test("throws on non-array input", () => {
    expect(() => buildBlankAttendanceRecords(null)).toThrow(
      "studentIds must be an array"
    );
    expect(() => buildBlankAttendanceRecords("nope")).toThrow(
      "studentIds must be an array"
    );
  });

  test("preserves order", () => {
    const ids = ["a", "b", "c"];
    const rows = buildBlankAttendanceRecords(ids);
    expect(rows.map((r) => r.student_id)).toEqual(ids);
  });
});
