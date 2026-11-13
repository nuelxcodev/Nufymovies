import { connectDB } from "@/lib/db";
import { Event } from "@/lib/models";
import { requireUser } from "@/lib/session";
import { ok, fail, readJson } from "@/lib/http";

// Records a download click (for the admin analytics).
export async function POST(req) {
  const { user, error } = await requireUser();
  if (error) return fail(error.message, error.status);
  const b = await readJson(req);
  if (b.type !== "download" || !b.key) return fail("Invalid event", 400);
  await connectDB();
  await Event.create({ type: "download", key: String(b.key).slice(0, 80), title: String(b.title || "").slice(0, 200), userId: user.isAdmin ? undefined : user.id, country: user.country });
  return ok();
}
