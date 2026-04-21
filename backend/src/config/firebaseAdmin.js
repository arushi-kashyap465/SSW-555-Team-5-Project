// backend/src/config/firebaseAdmin.js
// Initializes Firebase Admin once for both local dev and Cloud Functions.
//
// In Cloud Functions the runtime auto-provides credentials + projectId.
// Locally we fall back to GOOGLE_APPLICATION_CREDENTIALS + .firebaserc projectId.
import { initializeApp, applicationDefault, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const projectId =
  process.env.GCLOUD_PROJECT ||
  process.env.GOOGLE_CLOUD_PROJECT ||
  process.env.FIREBASE_PROJECT_ID ||
  "qr-based-attendance-app-86fbb";

const app =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: applicationDefault(),
        projectId
      });

const db = getFirestore(app);

export default db;
export { app };
