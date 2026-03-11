import { events as getEventsCollection } from "../config/mongoCollections.js";
import { checkString } from "../helpers/validation.js";

export async function createEvent(title, details) {
  const eventsCol = await getEventsCollection();

  title = checkString(title, "title");
  details = details === undefined || details === null ? "" : String(details).trim();

  const now = new Date();
  const newEvent = {
    title,
    details,
    createdAt: now,
    updatedAt: now,
  };

  const result = await eventsCol.insertOne(newEvent);
  if (!result.insertedId) {
    throw new Error("Failed to create event");
  }

  return {
    _id: result.insertedId.toString(),
    ...newEvent,
  };
}

export async function getAllEvents() {
  const eventsCol = await getEventsCollection();
  const docs = await eventsCol
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  return docs.map((e) => ({
    _id: e._id.toString(),
    title: e.title,
    details: e.details,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  }));
}

