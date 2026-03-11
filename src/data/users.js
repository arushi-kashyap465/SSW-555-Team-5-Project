import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import { users as getUsersCollection } from "../config/mongoCollections.js";

// Imports data validation functions from helpers/validation.js
import { 
  checkString, 
  checkAndNormalizeEmail, 
  checkPassword, checkId, 
  checkRole 
} from "../helpers/validation.js";

const SALT_ROUNDS = 12;

export async function registerUser(name, email, password, role) {
  const usersCol = await getUsersCollection();

  name = checkString(name, "name");
  email = checkAndNormalizeEmail(email);
  password = checkPassword(password);
  role = checkRole(role);

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

export async function loginUser(email, password) {
    const usersCol = await getUsersCollection();
  
    email = checkAndNormalizeEmail(email);
    password = checkPassword(password);
  
    const user = await usersCol.findOne({ email });
    if (!user || !user.password) {
      throw new Error("Invalid email or password");
    }
  
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new Error("Invalid email or password");
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

export async function getUserById(id) {
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

export async function getAllUsers() {
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

export async function deleteUser(id) {
  const usersCol = await getUsersCollection();
  id = checkId(id);

  const result = await usersCol.deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 0) {
    throw new Error("No user found to delete");
  }

  return { deleted: true, _id: id };
}

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