// backend/src/data/events.js
import { eventsCol } from "../config/firestoreCollections.js";
import { checkString } from "../helpers/validation.js";

export async function createEvent(title, details) {
  title = checkString(title, "title");
  details =
    details === undefined || details === null ? "" : String(details).trim();

  const now = new Date();
  const docRef = await eventsCol.add({
    title,
    details,
    createdAt: now,
    updatedAt: now
  });
  const savedDoc = await docRef.get();
  return { _id: savedDoc.id, ...savedDoc.data() };
}

export async function getAllEvents() {
  const snapshot = await eventsCol.orderBy("createdAt", "desc").get();
  return snapshot.docs.map((doc) => {
    const event = doc.data();
    return {
      _id: doc.id,
      title: event.title,
      details: event.details,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    };
  });
}
