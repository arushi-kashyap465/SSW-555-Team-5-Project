import { ObjectId } from 'mongodb';

// checkId
/* Determines whether an id is a valid ObjectId for MongoDB*/
export const checkId = (id, collection_name) => {
    id = id.trim();
    
    if (!id) throw `${collection_name} ID is not provided!`;

    if (typeof id !== 'string') throw `${collection_name} ID is not a string!`;

    if (ObjectId.isValid(id)) {
        return id;
    } 
    else {
        throw `Invalid ${collection_name} ID!`;
    }
}

// Course.js helper functions
export const checkString = (str, varName) => {
    str = str.trim();

    if (!str) throw `${varName} is not provided!`;
    if (typeof str !== 'string') throw `${varName} is not a string!`;

    return str;
}