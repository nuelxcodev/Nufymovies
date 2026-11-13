import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { requireUser } from "@/lib/session";
import { ok, fail, readJson } from "@/lib/http";
import { USERNAME, PHONE, cleanPhone, RESERVED } from "@/lib/validators";
import { isCountry } from "@/lib/countries";

// Users can edit phone and country. Username/age can only be set once (for older accounts that lack them);
// after that, age changes go through an admin so a child can't unlock adult content by editing it.
export async function PATCH(req) {
  const { user, error } = await requireUser();
  if (error) return fail(error.message, error.status);
  if (user.isAdmin) return fail("Not available for admin", 400);
  const b = await readJson(req);
  await connectDB();
  const doc = await User.findById(user.id);
  const errors = {};

  if (b.phone !== undefined) {
    const p = cleanPhone(b.phone);
    if (!PHONE.test(p)) errors.phone = "Enter digits only, e.g. +2348012345678";
    else doc.phone = p;
  }
  if (b.country !== undefined) {
    const c = String(b.country).toUpperCase();
    if (!isCountry(c)) errors.country = "Choose your country";
    else doc.country = c;
  }
  if (b.username !== undefined && !doc.username) {
    const u = String(b.username).trim();
    if (!USERNAME.test(u) || RESERVED.includes(u.toLowerCase())) errors.username = "3–20 characters: letters, numbers or underscore";
    else if (await User.findOne({ usernameLower: u.toLowerCase() })) errors.username = "That username is taken";
    else {
      doc.username = u;
      doc.usernameLower = u.toLowerCase();
    }
  }
  if (b.age !== undefined && !doc.age) {
    const a = Number(b.age);
    if (!Number.isInteger(a) || a < 5 || a > 120) errors.age = "Enter an age between 5 and 120";
    else doc.age = a;
  }
  if (Object.keys(errors).length) return fail("Please fix the highlighted fields", 400, { errors });
  await doc.save();
  return ok({ message: "Profile updated" });
}
