import { ObjectId } from "mongodb";
import { events as getEventsCollection, users as getUsersCollection } from "../config/mongoCollections.js";
import { checkString, checkId } from "../helpers/validation.js";

function requireId(id, label) {
  try {
    return checkId(id, label);
  } catch (e) {
    throw new Error(typeof e === "string" ? e : String(e));
  }
}

function normalizeAttendance(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((a) => a && a.userId)
    .map((a) => ({
      userId: a.userId instanceof ObjectId ? a.userId : new ObjectId(String(a.userId)),
      checkedInAt: a.checkedInAt ? new Date(a.checkedInAt) : new Date(),
      method: a.method === "manual" ? "manual" : "qr",
    }));
}

export async function createEvent(title, details, options = {}) {
  const eventsCol = await getEventsCollection();

  title = checkString(title, "title");
  details = details === undefined || details === null ? "" : String(details).trim();

  const now = new Date();
  let startsAt = null;
  let endsAt = null;
  if (options.startsAt != null) {
    const d = new Date(options.startsAt);
    if (!Number.isNaN(d.getTime())) startsAt = d;
  }
  if (options.endsAt != null) {
    const d = new Date(options.endsAt);
    if (!Number.isNaN(d.getTime())) endsAt = d;
  }

  const doc = {
    title,
    details,
    startsAt,
    endsAt,
    attendance: [],
    createdAt: now,
    updatedAt: now,
  };

  const result = await eventsCol.insertOne(doc);
  if (!result.insertedId) {
    throw new Error("Failed to create event");
  }

  return formatEventSummary(await eventsCol.findOne({ _id: result.insertedId }));
}

export async function getAllEvents() {
  const eventsCol = await getEventsCollection();
  const docs = await eventsCol
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  return docs.map((e) => formatEventSummary(e));
}

async function getEventDocById(id) {
  id = requireId(id, "Event");
  const eventsCol = await getEventsCollection();
  const doc = await eventsCol.findOne({ _id: new ObjectId(id) });
  if (!doc) throw new Error("Event not found");
  return doc;
}

export async function getEventAttendanceDetail(eventId) {
  const e = await getEventDocById(eventId);
  const usersCol = await getUsersCollection();
  const attendance = normalizeAttendance(e.attendance);

  const toIso = (d) => {
    const dt = d instanceof Date ? d : new Date(d);
    if (Number.isNaN(dt.getTime())) return new Date().toISOString();
    return dt.toISOString();
  };

  const attendees = [];
  for (const row of attendance) {
    const user = await usersCol.findOne({ _id: row.userId });
    attendees.push({
      userId: row.userId.toString(),
      name: user?.name ?? "Unknown",
      email: user?.email ?? "",
      role: user?.role ?? "",
      checkedInAt: toIso(row.checkedInAt),
      method: row.method,
    });
  }
  attendees.sort(
    (a, b) => new Date(a.checkedInAt) - new Date(b.checkedInAt)
  );

  return {
    event: formatEventSummary(e),
    attendees,
  };
}

export async function recordEventCheckIn(eventId, userId, method = "qr") {
  eventId = requireId(eventId, "Event");
  userId = requireId(userId, "User");
  const m = String(method || "qr").toLowerCase() === "manual" ? "manual" : "qr";

  const eventsCol = await getEventsCollection();
  const e = await getEventDocById(eventId);
  const uid = new ObjectId(userId);
  const now = new Date();
  const list = normalizeAttendance(e.attendance);

  const idx = list.findIndex((a) => a.userId.toString() === userId);
  if (idx === -1) {
    list.push({ userId: uid, checkedInAt: now, method: m });
  } else {
    list[idx] = { ...list[idx], checkedInAt: now, method: m };
  }

  await eventsCol.updateOne(
    { _id: new ObjectId(eventId) },
    { $set: { attendance: list, updatedAt: now } }
  );

  return getEventAttendanceDetail(eventId);
}

function formatEventSummary(e) {
  if (!e || !e._id) return null;
  const att = normalizeAttendance(e.attendance);
  return {
    _id: e._id.toString(),
    title: e.title,
    details: e.details ?? "",
    startsAt: e.startsAt ? new Date(e.startsAt).toISOString() : null,
    endsAt: e.endsAt ? new Date(e.endsAt).toISOString() : null,
    attendeeCount: att.length,
    createdAt: e.createdAt ? new Date(e.createdAt).toISOString() : null,
    updatedAt: e.updatedAt ? new Date(e.updatedAt).toISOString() : null,
  };
}
