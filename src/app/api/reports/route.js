import { connectDB } from "@/lib/db";
import { Report } from "@/lib/models";
import { requireUser } from "@/lib/session";
import { ok, fail, readJson } from "@/lib/http";
import { rateLimit } from "@/lib/rateLimit";

const TYPES = ["broken", "inappropriate", "wrong_age", "copyright", "other"];

export async function POST(req) {
  const { user, error } = await requireUser();
  if (error) return fail(error.message, error.status);
  if (!rateLimit(`rep:${user.id}`, 10, 60 * 60 * 1000).ok) return fail("You've sent a lot of reports. Try again later.", 429);
  const b = await readJson(req);
  const key = String(b.key || "").slice(0, 80);
  const href = String(b.href || "").slice(0, 200);
  if (!key || !href.startsWith("/")) return fail("Invalid report", 400);
  await connectDB();
  await Report.create({
    key,
    href,
    title: String(b.title || "").slice(0, 200),
    type: TYPES.includes(b.type) ? b.type : "other",
    message: String(b.message || "").trim().slice(0, 500),
    userId: user.isAdmin ? undefined : user.id,
    username: user.username,
  });
  return ok({ message: "Report sent. Thank you." });
}
