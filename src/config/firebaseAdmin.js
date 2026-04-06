// src/config/firebaseAdmin.js
import { initializeApp, applicationDefault, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const app =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: applicationDefault()
      });

const db = getFirestore(app);

export default db;