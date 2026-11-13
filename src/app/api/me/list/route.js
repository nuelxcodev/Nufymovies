import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { requireUser } from "@/lib/session";
import { ok, fail, readJson } from "@/lib/http";

const cleanItem = (b) => ({
  key: String(b.key || "").slice(0, 80),
  href: String(b.href || "").slice(0, 200),
  title: String(b.title || "").slice(0, 200),
  poster: String(b.poster || "").slice(0, 300) || undefined,
  year: String(b.year || "").slice(0, 4),
  genreIds: Array.isArray(b.genreIds) ? b.genreIds.map(Number).filter(Number.isFinite).slice(0, 8) : [],
  releaseDate: String(b.releaseDate || "").slice(0, 10),
  remind: Boolean(b.remind),
  addedAt: new Date(),
});

// Add (or update the reminder flag on) a My List entry.
export async function POST(req) {
  const { user, error } = await requireUser();
  if (error) return fail(error.message, error.status);
  if (user.isAdmin) return fail("Admin accounts don't have a watch list", 400);
  const item = cleanItem(await readJson(req));
  if (!item.key || !item.title || !item.href.startsWith("/")) return fail("Invalid item", 400);
  await connectDB();
  const doc = await User.findById(user.id).select("watchlist");
  const existing = doc.watchlist.find((w) => w.key === item.key);
  if (existing) existing.remind = item.remind;
  else {
    if (doc.watchlist.length >= 300) return fail("Your list is full (300 titles)", 400);
    doc.watchlist.unshift(item);
  }
  await doc.save();
  return ok();
}

export async function DELETE(req) {
  const { user, error } = await requireUser();
  if (error) return fail(error.message, error.status);
  const { key } = await readJson(req);
  if (!key || user.isAdmin) return fail("Invalid request", 400);
  await connectDB();
  await User.updateOne({ _id: user.id }, { $pull: { watchlist: { key: String(key) } } });
  return ok();
}
