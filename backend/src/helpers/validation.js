// backend/src/helpers/validation.js
// Validation helpers. All ID checks are for Firestore document IDs
// (opaque strings), so we no longer depend on MongoDB ObjectId.

export const checkString = (str, varName) => {
  if (typeof str !== "string") throw new Error(`${varName} is not a string!`);
  const trimmed = str.trim();
  if (!trimmed) throw new Error(`${varName} is not provided!`);
  return trimmed;
};

export const checkId = (id, name = "ID") => {
  if (typeof id !== "string") throw new Error(`${name} is not a string!`);
  const trimmed = id.trim();
  if (!trimmed) throw new Error(`${name} is not provided!`);
  // Firestore auto IDs are 20 chars but users can supply longer; we allow any
  // non-empty alnum-ish string.
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(trimmed)) {
    throw new Error(`Invalid ${name}!`);
  }
  return trimmed;
};

export const checkAndNormalizeEmail = (email) => {
  const e = checkString(email, "email").toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(e)) {
    throw new Error("email is not a valid email address");
  }
  return e;
};

export const checkPassword = (password) => {
  const p = checkString(password, "password");
  if (p.length < 6) {
    throw new Error("password must be at least 6 characters long");
  }
  return p;
};

export const checkRole = (role) => {
  const r = checkString(role, "role").toLowerCase();
  if (!["student", "instructor"].includes(r)) {
    throw new Error('role must be "student" or "instructor"');
  }
  return r;
};

export const checkStringArray = (arr, name) => {
  if (!Array.isArray(arr)) throw new Error(`${name} must be an array`);
  return arr.map((v, i) => checkString(v, `${name}[${i}]`));
};

export const checkIdArray = (arr, name) => {
  if (!Array.isArray(arr)) throw new Error(`${name} must be an array`);
  return arr.map((v, i) => checkId(v, `${name}[${i}]`));
};
