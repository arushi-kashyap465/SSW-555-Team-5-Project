import { ObjectId } from "mongodb";
import { buildBlankAttendanceRecords } from "../helpers/attendance.js";

describe("buildBlankAttendanceRecords", () => {
  test("creates one blank attendance record for each student id", () => {
    const studentIds = [new ObjectId().toString(), new ObjectId().toString()];

    const result = buildBlankAttendanceRecords(studentIds);

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(studentIds.length);

    result.forEach((record, index) => {
      expect(record).toHaveProperty("student_id");
      expect(record).toHaveProperty("status");
      expect(record).toHaveProperty("check_in_time");
      expect(record).toHaveProperty("method");

      expect(record.student_id).toBeInstanceOf(ObjectId);
      expect(record.student_id.toString()).toBe(studentIds[index]);

      expect(record.status).toBeNull();
      expect(record.check_in_time).toBeNull();
      expect(record.method).toBeNull();
    });
  });

  test("returns an empty array when given an empty array", () => {
    const result = buildBlankAttendanceRecords([]);

    expect(result).toEqual([]);
  });

  test("preserves the order of student ids", () => {
    const firstId = new ObjectId().toString();
    const secondId = new ObjectId().toString();
    const thirdId = new ObjectId().toString();

    const result = buildBlankAttendanceRecords([firstId, secondId, thirdId]);

    expect(result[0].student_id.toString()).toBe(firstId);
    expect(result[1].student_id.toString()).toBe(secondId);
    expect(result[2].student_id.toString()).toBe(thirdId);
  });

  test("throws an error when input is not an array", () => {
    expect(() => buildBlankAttendanceRecords(null)).toThrow(
      "studentIds must be an array"
    );

    expect(() => buildBlankAttendanceRecords("not an array")).toThrow(
      "studentIds must be an array"
    );

    expect(() => buildBlankAttendanceRecords(123)).toThrow(
      "studentIds must be an array"
    );
  });

  test("creates records with the correct default values", () => {
    const studentIds = [new ObjectId().toString()];

    const result = buildBlankAttendanceRecords(studentIds);

    expect(result[0]).toEqual({
      student_id: expect.any(ObjectId),
      status: null,
      check_in_time: null,
      method: null
    });
  });
});