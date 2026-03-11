import { ObjectId } from 'mongodb';
import { sessions } from '../config/mongoCollections.js';

// sessions.js
// Lists the sessions alongside the attendees, who registered, the organizer, etc.

/*
{
    _id: ObjectId,
    class_id: ObjectId,
    created_by: ObjectId (instructor),
    title: String,
    starts_at: String (MM/DD/YYYY HH:MM) (To be Date),
    ends_at: String (MM/DD/YYYY HH:MM) (To be Date),
    tokenHash: (hash of QR Code token),
    active: Boolean (whether the session is active or not),
    created_at: Date
    attendance: [RecordObject]
}
*/

export const getSessionById = async (id) => {
    id = checkId(id, "Session ID");
    const sessionsCollection = await sessions();
    const session = await sessionsCollection.findOne({ _id: new ObjectId(id) });

    if (!session) throw "Session not found!";
    return session;
}

/*
QR Code generation is to be implemented in the future, so tokenHash is currently set to null when a session is created.
*/
export const createSession = async (class_id, created_by, title, starts_at, ends_at) => {
    class_id = checkId(class_id, "Class ID");
    created_by = checkId(created_by, "Instructor ID");
    title = checkString(title, "Session Title");
    starts_at = checkString(starts_at, "Session Start Time");
    ends_at = checkString(ends_at, "Session End Time");
    const sessionsCollection = await sessions();

    const newSession = {
        class_id: new ObjectId(class_id),
        created_by: new ObjectId(created_by),
        title,
        starts_at,
        ends_at,
        tokenHash: null, // To be implemented when QR code generation is added
        active: false, // Default to false until the session is started by the instructor
        created_at: new Date(),
        attendance: []
    };
    const insertInfo = await sessionsCollection.insertOne(newSession);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw "Could not create session!";
    return await getSessionById(insertInfo.insertedId.toString());
}

export const getAllSessions = async () => {
    const sessionsCollection = await sessions();
    const allSessions = await sessionsCollection.find({}).toArray();
    return allSessions;
}

/*
TODO: Implement a route that generates a QR code token, hashes it, and updates the session with the tokenHash. This will be used for students to check in to the session.
TODO: Implement a route that allows students to check in to a session by providing the QR code for the session so that the students can scan it.
*/