// backend/src/data/courses.js
// Firestore-backed course management.
//
// Shape:
// {
//   _id: docId,
//   course_name: string,
//   description: string,
//   instructor: userId,
//   students: [userId],     // enrolled students
//   createdAt, updatedAt
// }
//
// (sessions are stored in their own `sessions` collection, linked by course_id.)
import { coursesCol, sessionsCol } from "../config/firestoreCollections.js";
import {
  checkId,
  checkString,
  checkIdArray
} from "../helpers/validation.js";

const serialize = (id, data) => ({
  _id: id,
  course_name: data.course_name,
  description: data.description,
  instructor: data.instructor,
  students: data.students || [],
  createdAt: data.createdAt,
  updatedAt: data.updatedAt
});

export const createCourse = async (
  course_name,
  description,
  instructor,
  students = []
) => {
  course_name = checkString(course_name, "Course Name");
  description = checkString(description, "Course Description");
  instructor = checkId(instructor, "Instructor ID");
  students = checkIdArray(students, "students");

  const now = new Date();
  const ref = await coursesCol.add({
    course_name,
    description,
    instructor,
    students,
    createdAt: now,
    updatedAt: now
  });
  const doc = await ref.get();
  return serialize(doc.id, doc.data());
};

export const getCourseById = async (id) => {
  id = checkId(id, "Course ID");
  const doc = await coursesCol.doc(id).get();
  if (!doc.exists) throw new Error("Course not found!");
  return serialize(doc.id, doc.data());
};

export const getAllCourses = async () => {
  const snap = await coursesCol.get();
  return snap.docs.map((d) => serialize(d.id, d.data()));
};

export const getCoursesByInstructor = async (instructorId) => {
  instructorId = checkId(instructorId, "Instructor ID");
  const snap = await coursesCol.where("instructor", "==", instructorId).get();
  return snap.docs.map((d) => serialize(d.id, d.data()));
};

export const getCoursesForStudent = async (studentId) => {
  studentId = checkId(studentId, "Student ID");
  const snap = await coursesCol
    .where("students", "array-contains", studentId)
    .get();
  return snap.docs.map((d) => serialize(d.id, d.data()));
};

export const getStudentsInCourse = async (course_id) => {
  course_id = checkId(course_id, "Course ID");
  const doc = await coursesCol.doc(course_id).get();
  if (!doc.exists) throw new Error("Course not found!");
  return doc.data().students || [];
};

export const enrollStudent = async (course_id, student_id) => {
  course_id = checkId(course_id, "Course ID");
  student_id = checkId(student_id, "Student ID");
  const ref = coursesCol.doc(course_id);
  const doc = await ref.get();
  if (!doc.exists) throw new Error("Course not found!");

  const data = doc.data();
  const students = Array.isArray(data.students) ? data.students : [];
  if (!students.includes(student_id)) {
    students.push(student_id);
    await ref.update({ students, updatedAt: new Date() });
  }
  const updated = await ref.get();
  return serialize(updated.id, updated.data());
};

export const getSessionsForCourse = async (course_id) => {
  course_id = checkId(course_id, "Course ID");
  const snap = await sessionsCol
    .where("course_id", "==", course_id)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => ({ _id: d.id, ...d.data() }));
};
