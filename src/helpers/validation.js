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

export const checkAndNormalizeEmail = (email) => {
    const e = checkString(email, "email").toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(e)) {
        throw new Error("email is not a valid email address");
    }
    return e;
}

export const checkPassword = (password) => {
    const p = checkString(password, "password");
    if (p.length < 6) {
        throw new Error("password must be at least 6 characters long");
    }
    return p;
}

export const checkRole = (role) => {
    const r = checkString(role, "role").toLowerCase();
    if (!["student", "instructor"].includes(r)) {
        throw new Error('role must be "student" or "instructor"');
    }
    return r;
}