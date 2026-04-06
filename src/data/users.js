import bcrypt from "bcrypt";
import { usersCol } from "../config/firestoreCollections.js";

import {
  checkString,
  checkAndNormalizeEmail,
  checkPassword,
  checkId,
  checkRole
} from "../helpers/validation.js";

const SALT_ROUNDS = 12;

export async function registerUser(name, email, password, role) {
  name = checkString(name, "name");
  email = checkAndNormalizeEmail(email);
  password = checkPassword(password);
  role = checkRole(role);

  const existing = await usersCol.where("email", "==", email).limit(1).get();
  if (!existing.empty) {
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
    updatedAt: now
  };

  const docRef = await usersCol.add(newUser);
  const savedDoc = await docRef.get();
  const savedData = savedDoc.data();

  return {
    _id: savedDoc.id,
    name: savedData.name,
    email: savedData.email,
    role: savedData.role,
    createdAt: savedData.createdAt,
    updatedAt: savedData.updatedAt
  };
}

export async function loginUser(email, password) {
  email = checkAndNormalizeEmail(email);
  password = checkPassword(password);

  const result = await usersCol.where("email", "==", email).limit(1).get();
  if (result.empty) {
    throw new Error("Invalid email or password");
  }

  const doc = result.docs[0];
  const user = doc.data();

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new Error("Invalid email or password");
  }

  return {
    _id: doc.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

export async function getUserById(id) {
  id = checkId(id);

  const doc = await usersCol.doc(id).get();
  if (!doc.exists) {
    throw new Error("User not found");
  }

  const user = doc.data();

  return {
    _id: doc.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

export async function getAllUsers() {
  const snapshot = await usersCol.get();

  return snapshot.docs.map((doc) => {
    const user = doc.data();
    return {
      _id: doc.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  });
}

export async function deleteUser(id) {
  id = checkId(id);

  const ref = usersCol.doc(id);
  const doc = await ref.get();

  if (!doc.exists) {
    throw new Error("No user found to delete");
  }

  await ref.delete();
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