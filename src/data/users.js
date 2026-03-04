import { ObjectId } from 'mongodb';
import { courses } from '../config/mongoCollections';
import { checkId, checkString } from '../helpers';

// Defines users. Whether they be an instructor or a student, any methods will be listed here.

/*
{
    _id: ObjectId,
    name: String,
    email: String,
    password: String (stored as hash),
    role: String (either "student" or "instructor". Case insenstive),

}
*/