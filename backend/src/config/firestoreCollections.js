// backend/src/config/firestoreCollections.js
import db from "./firebaseAdmin.js";

export const usersCol = db.collection("users");
export const eventsCol = db.collection("events");
export const coursesCol = db.collection("courses");
export const sessionsCol = db.collection("sessions");
export const attendanceCol = db.collection("attendanceRecords");
