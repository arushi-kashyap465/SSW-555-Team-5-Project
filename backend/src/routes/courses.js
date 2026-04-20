// backend/src/routes/courses.js
import { Router } from "express";
import {
  createCourse,
  getCourseById,
  getAllCourses,
  getCoursesByInstructor,
  getCoursesForStudent,
  enrollStudent,
  getSessionsForCourse
} from "../data/courses.js";
import { loginRequired, requireRole } from "../middleware/middleware.js";

const router = Router();

// Teacher creates a course they own.
router.post("/", loginRequired, requireRole("instructor"), async (req, res) => {
  try {
    const { course_name, description, students } = req.body || {};
    const course = await createCourse(
      course_name,
      description,
      req.user._id,
      students || []
    );
    res.status(201).json(course);
  } catch (e) {
    res.status(400).json({ error: e.message || String(e) });
  }
});

// List — filtered by role automatically so each dashboard gets the right view.
router.get("/", loginRequired, async (req, res) => {
  try {
    let courses;
    if (req.user.role === "instructor") {
      courses = await getCoursesByInstructor(req.user._id);
    } else {
      courses = await getCoursesForStudent(req.user._id);
    }
    res.json(courses);
  } catch (e) {
    res.status(500).json({ error: e.message || String(e) });
  }
});

// Admin/full list — instructors only.
router.get(
  "/all",
  loginRequired,
  requireRole("instructor"),
  async (_req, res) => {
    try {
      res.json(await getAllCourses());
    } catch (e) {
      res.status(500).json({ error: e.message || String(e) });
    }
  }
);

router.get("/:id", loginRequired, async (req, res) => {
  try {
    res.json(await getCourseById(req.params.id));
  } catch (e) {
    res.status(404).json({ error: e.message || String(e) });
  }
});

router.get("/:id/sessions", loginRequired, async (req, res) => {
  try {
    res.json(await getSessionsForCourse(req.params.id));
  } catch (e) {
    res.status(404).json({ error: e.message || String(e) });
  }
});

// Enroll a student by id (teacher action).
router.post(
  "/:id/enroll",
  loginRequired,
  requireRole("instructor"),
  async (req, res) => {
    try {
      const { student_id } = req.body || {};
      const course = await enrollStudent(req.params.id, student_id);
      res.json(course);
    } catch (e) {
      res.status(400).json({ error: e.message || String(e) });
    }
  }
);

// Student self-enroll — lets demo students attach to a course they know the id of.
router.post(
  "/:id/join",
  loginRequired,
  requireRole("student"),
  async (req, res) => {
    try {
      const course = await enrollStudent(req.params.id, req.user._id);
      res.json(course);
    } catch (e) {
      res.status(400).json({ error: e.message || String(e) });
    }
  }
);

export default router;
