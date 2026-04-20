// backend/src/config/settings.js
// Central app settings. Hosting domain is used to build QR URLs.

export const appConfig = {
  // When deployed, override via env. Locally the same value works because
  // the scan page is served by Firebase Hosting.
  hostingUrl:
    process.env.HOSTING_URL ||
    "https://qr-based-attendance-app-86fbb.web.app",
  jwtSecret: process.env.JWT_SECRET || "dev-only-change-me",
  jwtExpiresIn: "7d"
};
