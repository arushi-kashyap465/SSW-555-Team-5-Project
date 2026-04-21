// backend/src/helpers/qr-generation.js
// Builds a real scan URL for a session and converts it to a base64 PNG data URL.
import QRCode from "qrcode";
import crypto from "crypto";
import { appConfig } from "../config/settings.js";

export const buildScanUrl = (sessionId, token, hostingUrl) => {
  const base = (hostingUrl || appConfig.hostingUrl).replace(/\/$/, "");
  return `${base}/scan.html?sessionId=${encodeURIComponent(
    sessionId
  )}&token=${encodeURIComponent(token)}`;
};

export const generateSessionToken = () => {
  // URL-safe random token (32 bytes = 43 chars base64url).
  return crypto.randomBytes(32).toString("base64url");
};

export const generateQRCode = async (sessionId, token, hostingUrl) => {
  const url = buildScanUrl(sessionId, token, hostingUrl);
  const dataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    width: 320,
    margin: 1
  });
  return { url, dataUrl };
};

// Retained for backwards compat with existing /api/health/qr test endpoint.
export const generateTestQRCode = async () => {
  return await QRCode.toDataURL("https://example.com/");
};
