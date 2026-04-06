// Test file to verify Firebase Admin SDK is working correctly. 
// Run with `node src/testing/test.js`.

import db from "../config/firebaseAdmin.js";

async function testFirestore() {
  try {
    const docRef = await db.collection("test").add({
      message: "Hello Firebase!",
      timestamp: new Date()
    });

    console.log("✅ Firestore working! Doc ID:", docRef.id);
  } catch (e) {
    console.error("❌ Firestore error:", e);
  }
}

testFirestore();