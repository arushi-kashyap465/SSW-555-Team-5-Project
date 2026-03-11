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

export const getAttendanceRecordsBySession = async (sessionId) => {
    checkId(sessionId);
  
    const attendanceCollection = await attendanceRecords();
  
    const records = await attendanceCollection
      .find({ session_id: new ObjectId(sessionId) })
      .toArray();
  
    return records;
  };

  