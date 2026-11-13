import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "@/lib/models/User";
import Review from "@/lib/models/Review";
import { ok, fail, readJson } from "@/lib/http";
import { guard } from "../../guard";

const valid = (id) => mongoose.isValidObjectId(id);

// Body may include: status ("active"|"suspended"), age, newPassword
export async function PATCH(req, { params }) {
  const denied = await guard();
  if (denied) return denied;
  if (!valid(params.id)) return fail("Invalid user", 400);
  const b = await readJson(req);
  const update = {};
  if (b.status !== undefined) {
    if (!["active", "suspended"].includes(b.status)) return fail("Invalid status", 400);
    update.status = b.status;
  }
  if (b.age !== undefined) {
    const a = Number(b.age);
    if (!Number.isInteger(a) || a < 1 || a > 120) return fail("Age must be 1–120", 400);
    update.age = a;
  }
  if (b.newPassword !== undefined) {
    if (String(b.newPassword).length < 8) return fail("Password must be at least 8 characters", 400);
    update.password = await bcrypt.hash(String(b.newPassword), 10);
  }
  if (!Object.keys(update).length) return fail("Nothing to update", 400);
  const u = await User.findByIdAndUpdate(params.id, update, { new: true }).select("username status age");
  return u ? ok({ message: "User updated" }) : fail("User not found", 404);
}

export async function DELETE(_req, { params }) {
  const denied = await guard();
  if (denied) return denied;
  if (!valid(params.id)) return fail("Invalid user", 400);
  const u = await User.findByIdAndDelete(params.id);
  if (!u) return fail("User not found", 404);
  await Review.deleteMany({ userId: params.id });
  return ok({ message: "User deleted" });
}
