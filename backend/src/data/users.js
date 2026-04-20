// backend/src/data/users.js
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

const serializeUser = (docId, data) => ({
  _id: docId,
  name: data.name,
  email: data.email,
  role: data.role,
  createdAt: data.createdAt,
  updatedAt: data.updatedAt
});

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

  const docRef = await usersCol.add({
    name,
    email,
    password: passwordHash,
    role,
    createdAt: now,
    updatedAt: now
  });
  const savedDoc = await docRef.get();
  return serializeUser(savedDoc.id, savedDoc.data());
}

export async function loginUser(email, password) {
  email = checkAndNormalizeEmail(email);
  password = checkPassword(password);

  const result = await usersCol.where("email", "==", email).limit(1).get();
  if (result.empty) throw new Error("Invalid email or password");

  const doc = result.docs[0];
  const user = doc.data();

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid email or password");

  return serializeUser(doc.id, user);
}

export async function getUserById(id) {
  id = checkId(id, "user");
  const doc = await usersCol.doc(id).get();
  if (!doc.exists) throw new Error("User not found");
  return serializeUser(doc.id, doc.data());
}

export async function getAllUsers() {
  const snapshot = await usersCol.get();
  return snapshot.docs.map((doc) => serializeUser(doc.id, doc.data()));
}

export async function getStudents() {
  const snapshot = await usersCol.where("role", "==", "student").get();
  return snapshot.docs.map((doc) => serializeUser(doc.id, doc.data()));
}

export async function deleteUser(id) {
  id = checkId(id, "user");
  const ref = usersCol.doc(id);
  const doc = await ref.get();
  if (!doc.exists) throw new Error("No user found to delete");
  await ref.delete();
  return { deleted: true, _id: id };
}
