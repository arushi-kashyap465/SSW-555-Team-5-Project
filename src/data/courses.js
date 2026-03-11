import { ObjectId } from 'mongodb';
import { courses } from '../config/mongoCollections.js';
import { checkId, checkString } from '../helpers/validation.js';

// Defines courses
// . Whether they be an in-person or online class, any methods will be listed here.

/*
{
    _id: ObjectId,
    course_name: String,
    description: String,
    instructor: ObjectId,
    students: [ObjectId],
    sessions: [ObjectId]
}
*/

/*
{
    _id: ObjectId,
    class_id: ObjectId,
    created_by: ObjectId (instructor),
    title: String,
    starts_at: String (MM/DD/YYYY HH:MM) (To be Date),
    ends_at: String (MM/DD/YYYY HH:MM) (To be Date),
    tokenHash: (hash of QR Code token),
    active: Boolean (whether the session is active or not),
    created_at: Date
    attendance: [RecordObject]
}

RecordObject {
    student_id: ObjectId,
    status: String (e.g. "present", "late", "absent"),
    check_in_time: Date,
    method: String (e.g. "qr", "manual")
}
*/

const createRecordObjectArray = (course_id) => {
    const students = getStudentsInCourse(course_id);
    // Creates an array of blank attendance records for each student in the course when a session is created
    const recordObjectArray = students.map(student_id => ({
        student_id: new ObjectId(student_id),
        status: null,
        check_in_time: null,
        method: null
    }));
    return recordObjectArray;
    // For status null => "-"

}

export const getCourseById = async (id) => {
    id = checkId(id, "Course ID");
    const coursesCollection = await courses();

    const course = await coursesCollection.findOne({ _id: new ObjectId(id) });

    if (!course) throw "Course not found!";

    return course;
}

export const createCourse = async (course_name, description, instructor, students, sessions) => {
    course_name = checkString(course_name, "Course Name");
    description = checkString(description, "Course Description");
    instructor = checkId(instructor, "Instructor ID");
    if (!Array.isArray(students)) throw "Students must be an array!";

    students.forEach(student => {
        checkId(student, "Student ID");
    });

    if (!Array.isArray(sessions)) throw "Sessions must be an array!";

    sessions.forEach(session => {
        checkId(session, "Session ID");
    });

    const coursesCollection = await courses();

    const newCourse = {
        course_name,
        description,
        instructor: new ObjectId(instructor),
        students: students.map(student => new ObjectId(student)),
        sessions: sessions.map(session => new ObjectId(session))
    };

    const insertInfo = await coursesCollection.insertOne(newCourse);

    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw "Could not create course!";

    return await getCourseById(insertInfo.insertedId.toString());
}

export const getAllCourses = async () => {
    const coursesCollection = await courses();
    const allCourses = await coursesCollection.find({}).toArray();
    return allCourses;
}

export const getStudentsInCourse = async (course_id) => {
    course_id = checkId(course_id, "Course ID");
    const coursesCollection = await courses();
    const course = await coursesCollection.findOne({ _id: new ObjectId(course_id) });

    if (!course) throw "Course not found!";
    return course.students;
}
