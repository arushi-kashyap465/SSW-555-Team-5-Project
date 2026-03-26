import { Router } from 'express';
import { createSession, getSessionById, getAllSessions } from '../data/sessions.js';
import { sessions } from '../config/mongoCollections.js';

const router = Router();

router.post('/', async (req, res) => {
    try {
        const { course_name, description, instructor, students, sessions } = req.body;
        const newCourse = await createCourse(course_name, description, instructor, students, sessions);
        res.status(201).json(newCourse);
    } catch (e) {
        res.status(400).json({ error: e.toString() });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const course = await getCourseById(req.params.id);
        res.status(200).json(course);
    } catch (e) {
        res.status(404).json({ error: e.toString() });
    } 
});

router.get('/', async (req, res) => {
    try {
        const courses = await getAllCourses();
        res.status(200).json(courses);
    } catch (e) {
        res.status(500).json({ error: e.toString() });
    }
});

router.post('/:id/scan', async (req, res) => {
    try {
      const sessionId = req.params.id;
      const { studentId } = req.body;
  
      if (!studentId) {
        return res.status(400).json({ error: "studentId required" });
      }
  
      const session = await getSessionById(sessionId);
  
      const updatedAttendance = session.attendance.map((record) => {
        if (record.student_id.toString() === studentId) {
          return {
            ...record,
            status: "present",
            check_in_time: new Date(),
            method: "qr"
          };
        }
        return record;
      });
  
      const sessionsCollection = await sessions();
      await sessionsCollection.updateOne(
        { _id: session._id },
        { $set: { attendance: updatedAttendance } }
      );
  
      res.json({ success: true });
  
    } catch (e) {
      res.status(500).json({ error: e.toString() });
    }
  });

export default router;