import { ObjectId } from 'mongodb';

// checkId
/* Determines whether an id is a valid ObjectId for MongoDB*/
export const checkId = (id) => {
    if (ObjectId.isValid(id)) {
        return id;
    } 
    else {
        throw 'Invalid ID';
    }
}