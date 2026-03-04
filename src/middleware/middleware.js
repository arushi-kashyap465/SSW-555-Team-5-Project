import { ObjectId } from 'mongodb';

// loginRequired.
/*
Middleware to check if the user is logged in.
- Used to ensure that the user is logged in before being able to register or mark their attendance.

*/
export const loginRequired = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Forbidden. You must be logged in to perform this action!" });
    } else {
        next();
    }
};