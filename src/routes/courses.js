import { Router } from 'express';
import { createCourse, getCourseById, getAllCourses } from '../data/courses.js';

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

export default router;