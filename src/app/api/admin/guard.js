import { requireAdmin } from "@/lib/session";
import { fail } from "@/lib/http";
import { connectDB } from "@/lib/db";

// Returns a Response if the caller isn't admin, otherwise connects the DB and returns null.
export async function guard() {
  const { error } = await requireAdmin();
  if (error) return fail("Not found", 404);
  await connectDB();
  return null;
}
