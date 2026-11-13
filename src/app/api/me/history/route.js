import { connectDB } from "@/lib/db";
import { User, Event } from "@/lib/models";
import { requireUser } from "@/lib/session";
import { ok, fail, readJson } from "@/lib/http";

// Save playback progress ("Continue watching"). Called every ~20s while playing.
export async function POST(req) {
  const { user, error } = await requireUser();
  if (error) return fail(error.message, error.status);
  if (user.isAdmin) return ok();
  const b = await readJson(req);
  const key = String(b.key || "").slice(0, 80);
  const position = Number(b.position);
  const duration = Number(b.duration);
  if (!key || !Number.isFinite(position) || !Number.isFinite(duration) || duration <= 0) return fail("Invalid progress", 400);

  const entry = {
    key,
    href: String(b.href || "").slice(0, 200),
    title: String(b.title || "").slice(0, 200),
    poster: String(b.poster || "").slice(0, 300) || undefined,
    backdrop: String(b.backdrop || "").slice(0, 300) || undefined,
    genreIds: Array.isArray(b.genreIds) ? b.genreIds.map(Number).filter(Number.isFinite).slice(0, 8) : [],
    position: Math.max(0, Math.floor(position)),
    duration: Math.floor(duration),
    updatedAt: new Date(),
  };
  if (!entry.href.startsWith("/")) return fail("Invalid item", 400);

  await connectDB();
  await User.updateOne({ _id: user.id }, { $pull: { history: { key } } });
  await User.updateOne({ _id: user.id }, { $push: { history: { $each: [entry], $position: 0, $slice: 40 } } });
  if (entry.position <= 30) Event.create({ type: "play", key, title: entry.title, userId: user.id, country: user.country }).catch(() => {});
  return ok();
}

export async function DELETE(req) {
  const { user, error } = await requireUser();
  if (error) return fail(error.message, error.status);
  const { key } = await readJson(req);
  if (user.isAdmin) return ok();
  await connectDB();
  await User.updateOne({ _id: user.id }, key ? { $pull: { history: { key: String(key) } } } : { $set: { history: [] } });
  return ok();
}
