import { ObjectId } from 'mongodb';

// sessions.js
// Lists the sessions alongside the attendees, who registered, the organizer, etc.

/*
{
    _id: ObjectId,
    class_id: ObjectId,
    created_by: ObjectId (instructor),
    title: String,
    starts_at: Date,
    ends_at: Date,
    tokenHash: (hash of QR Code token),
    active: Boolean (whether the session is active or not),
    created_at: Date
}
*/