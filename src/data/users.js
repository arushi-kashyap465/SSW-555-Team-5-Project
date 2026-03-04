const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
const { users: getUsersCollection } = require("../config/mongoCollections.js");

const SALT_ROUNDS = 12;

function checkString(value, fieldName) {
  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be a string`);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${fieldName} cannot be empty or just spaces`);
  }
  return trimmed;
}

function normalizeEmail(email) {
  const e = checkString(email, "email").toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(e)) {
    throw new Error("email is not a valid email address");
  }
  return e;
}

function normalizeRole(role) {
  const r = checkString(role, "role").toLowerCase();
  if (!["student", "instructor"].includes(r)) {
    throw new Error('role must be "student" or "instructor"');
  }
  return r;
}

function validatePassword(password) {
  const p = checkString(password, "password");
  if (p.length < 6) {
    throw new Error("password must be at least 6 characters long");
  }
  return p;
}

function checkId(id, fieldName = "_id") {
  const s = checkString(id, fieldName);
  if (!ObjectId.isValid(s)) {
    throw new Error(`${fieldName} is not a valid ObjectId`);
  }
  return s;
}

async function registerUser(name, email, password, role) {
  const usersCol = await getUsersCollection();

  name = checkString(name, "name");
  email = normalizeEmail(email);
  password = validatePassword(password);
  role = normalizeRole(role);

  const existing = await usersCol.findOne({ email });
  if (existing) {
    throw new Error("A user with that email already exists");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const now = new Date();

  const newUser = {
    name,
    email,
    password: passwordHash,
    role,
    createdAt: now,
    updatedAt: now,
  };

  const result = await usersCol.insertOne(newUser);
  if (!result.insertedId) {
    throw new Error("Failed to create user");
  }

  return {
    _id: result.insertedId.toString(),
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    createdAt: newUser.createdAt,
    updatedAt: newUser.updatedAt,
  };
}

async function getUserById(id) {
  const usersCol = await getUsersCollection();
  id = checkId(id);

  const user = await usersCol.findOne({ _id: new ObjectId(id) });
  if (!user) {
    throw new Error("User not found");
  }

  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function getAllUsers() {
  const usersCol = await getUsersCollection();
  const docs = await usersCol.find({}).toArray();

  return docs.map((u) => ({
    _id: u._id.toString(),
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }));
}

async function deleteUser(id) {
  const usersCol = await getUsersCollection();
  id = checkId(id);

  const result = await usersCol.deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 0) {
    throw new Error("No user found to delete");
  }

  return { deleted: true, _id: id };
}

module.exports = {
  registerUser,
  getUserById,
  getAllUsers,
  deleteUser,
};

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