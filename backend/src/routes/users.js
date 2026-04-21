// backend/src/routes/users.js
import express from "express";
import {
  registerUser,
  loginUser,
  getUserById,
  getAllUsers,
  getStudents,
  deleteUser
} from "../data/users.js";
import { signAuthToken } from "../helpers/auth.js";
import { loginRequired, requireRole } from "../middleware/middleware.js";

const router = express.Router();

// Shape used consistently by both register and login so the frontend
// can store the token and `user` the same way in every flow.
const buildAuthResponse = (user) => ({
  token: signAuthToken(user),
  user
});

router.post("/users/register", async (req, res) => {
  const { name, email, password, role } = req.body || {};
  try {
    const user = await registerUser(name, email, password, role);
    return res.status(201).json(buildAuthResponse(user));
  } catch (err) {
    return res.status(400).json({ error: err.message || String(err) });
  }
});

router.post("/users/login", async (req, res) => {
  const { email, password } = req.body || {};
  try {
    const user = await loginUser(email, password);
    return res.json(buildAuthResponse(user));
  } catch (err) {
    return res.status(400).json({ error: err.message || String(err) });
  }
});

router.get("/users/me", loginRequired, async (req, res) => {
  try {
    const user = await getUserById(req.user._id);
    return res.json({ user });
  } catch (err) {
    return res.status(404).json({ error: err.message || String(err) });
  }
});

router.get("/users", loginRequired, requireRole("instructor"), async (_req, res) => {
  try {
    const users = await getAllUsers();
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) });
  }
});

router.get(
  "/users/students",
  loginRequired,
  requireRole("instructor"),
  async (_req, res) => {
    try {
      const users = await getStudents();
      return res.json(users);
    } catch (err) {
      return res.status(500).json({ error: err.message || String(err) });
    }
  }
);

router.get("/users/:id", loginRequired, async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    return res.json(user);
  } catch (err) {
    return res.status(404).json({ error: err.message || String(err) });
  }
});

router.delete(
  "/users/:id",
  loginRequired,
  requireRole("instructor"),
  async (req, res) => {
    try {
      const result = await deleteUser(req.params.id);
      return res.json(result);
    } catch (err) {
      return res.status(400).json({ error: err.message || String(err) });
    }
  }
);

export default router;
