import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { requireUser } from "@/lib/session";
import { rateLimit } from "@/lib/rateLimit";
import { ok, fail, readJson } from "@/lib/http";

export async function POST(req) {
  const { user, error } = await requireUser();
  if (error) return fail(error.message, error.status);
  if (user.isAdmin) return fail("Change the admin password in your environment variables", 400);
  if (!rateLimit(`pw:${user.id}`, 6, 15 * 60 * 1000).ok) return fail("Too many attempts. Try again later.", 429);
  const { current, next } = await readJson(req);
  if (typeof next !== "string" || next.length < 8 || !/[A-Za-z]/.test(next) || !/[0-9]/.test(next)) {
    return fail("New password needs 8+ characters with a letter and a number", 400);
  }
  await connectDB();
  const doc = await User.findById(user.id);
  if (!(await bcrypt.compare(String(current || ""), doc.password))) return fail("Current password is incorrect", 400);
  doc.password = await bcrypt.hash(next, 10);
  await doc.save();
  return ok({ message: "Password changed" });
}
