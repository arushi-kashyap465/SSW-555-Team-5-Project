import {dbConnection} from './mongoConnection.js';

/* This will allow you to have one reference to each collection per app */
/* Feel free to copy and paste this this */
const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }

    return _col;
  };
};

/* Now, you can list your collections here: */
// export const example = getCollectionFn('example');
export const users = getCollectionFn('users');
export const courses = getCollectionFn('courses');
export const sessions = getCollectionFn('sessions');
export const attendanceRecords = getCollectionFn('attendanceRecords');
