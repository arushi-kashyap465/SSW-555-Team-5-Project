import { ObjectId } from 'mongodb';
import { attendanceRecords } from '../config/mongoCollections.js';
import { checkId } from '../helpers/validation.js';

// attendanceRecords. Contains the attendance records for each session.

/*
{
    _id: ObjectId,
    session_id: ObjectId,

}
*/