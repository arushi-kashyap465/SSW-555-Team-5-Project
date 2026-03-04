import { ObjectId } from 'mongodb';
import { courses } from '../config/mongoCollections.js';
import { checkId, checkString } from '../helpers.js';

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