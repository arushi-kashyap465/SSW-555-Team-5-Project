// backend/src/middleware/middleware.js
// Stateless auth middleware. Expects `Authorization: Bearer <jwt>`.
import { verifyAuthToken } from "../helpers/auth.js";

export const loginRequired = (req, res, next) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Forbidden. You must be logged in to perform this action!" });
  }

  const token = header.slice("Bearer ".length).trim();

  try {
    const payload = verifyAuthToken(token);
    req.user = {
      _id: payload.sub,
      email: payload.email,
      role: payload.role,
      name: payload.name
    };
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const requireRole = (role) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  if (req.user.role !== role) {
    return res
      .status(403)
      .json({ error: `Forbidden. This action requires role: ${role}` });
  }
  next();
};

export const requestLogger = (req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
};
