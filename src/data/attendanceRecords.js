import { ObjectId } from 'mongodb';
import { attendanceRecords } from '../config/mongoCollections';
import { checkId } from '../helpers';

// attendanceRecords. Contains the attendance records for each session.

/*
{
    _id: ObjectId,
    session_id: ObjectId,

}
*/