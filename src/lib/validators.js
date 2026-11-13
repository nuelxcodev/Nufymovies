import { isCountry } from "./countries";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME = /^[a-zA-Z0-9_]{3,20}$/;
const PHONE = /^\+?[0-9]{7,15}$/;
export const RESERVED = ["admin", "administrator", "root", "support", "nufy", "moderator", "staff"];

export const cleanPhone = (p) => String(p || "").replace(/[\s\-().]/g, "");

export function validateSignup(b) {
  const errors = {};
  const username = String(b.username || "").trim();
  const email = String(b.email || "").trim().toLowerCase();
  const password = String(b.password || "");
  const phone = cleanPhone(b.phone);
  const country = String(b.country || "").toUpperCase();
  const age = Number(b.age);

  if (!USERNAME.test(username)) errors.username = "3–20 characters: letters, numbers or underscore";
  else if (RESERVED.includes(username.toLowerCase())) errors.username = "That username is reserved";
  if (!EMAIL.test(email)) errors.email = "Enter a valid email address";
  if (password.length < 8) errors.password = "Use at least 8 characters";
  else if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) errors.password = "Include at least one letter and one number";
  if (!PHONE.test(phone)) errors.phone = "Enter digits only, e.g. +2348012345678";
  if (!isCountry(country)) errors.country = "Choose your country";
  if (!Number.isInteger(age) || age < 5 || age > 120) errors.age = "Enter an age between 5 and 120";

  return { errors, values: { username, email, password, phone, country, age } };
}

export { EMAIL, USERNAME, PHONE };
