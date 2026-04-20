// backend/src/helpers/auth.js
// JWT helpers for stateless auth (works in Cloud Functions, no session store).
import jwt from "jsonwebtoken";
import { appConfig } from "../config/settings.js";

export const signAuthToken = (user) => {
  return jwt.sign(
    { sub: user._id, email: user.email, role: user.role, name: user.name },
    appConfig.jwtSecret,
    { expiresIn: appConfig.jwtExpiresIn }
  );
};

export const verifyAuthToken = (token) => {
  return jwt.verify(token, appConfig.jwtSecret);
};
