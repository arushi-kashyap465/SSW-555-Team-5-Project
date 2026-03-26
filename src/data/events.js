import { ObjectId } from 'mongodb';
import { events as getEventsCollection } from "../config/mongoCollections.js";
import { checkString } from "../helpers/validation.js";

export async function createEvent(title, details, teacherId) {
  const eventsCol = await getEventsCollection();

  title = checkString(title, "title");
  details = details === undefined || details === null ? "" : String(details).trim();
  teacherId = checkId(teacherId, "Teacher ID");

  const now = new Date();
  const qrCode = `event-${Date.now()}`;
  const newEvent = {
    title,
    details,
    created_by: new ObjectId(teacherId),
    qrCode,
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
    created_by: e.created_by?.toString(),
    qrCode: e.qrCode,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  }));
}

