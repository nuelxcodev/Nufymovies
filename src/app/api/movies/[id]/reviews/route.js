import { connectDB } from "@/lib/db";
import Review from "@/lib/models/Review";
import User from "@/lib/models/User";
import { requireUser, getCurrentUser } from "@/lib/session";
import { ok, fail, readJson } from "@/lib/http";
import { rateLimit } from "@/lib/rateLimit";

const idOf = (params) => {
  const n = Number(params.id);
  return Number.isInteger(n) && n > 0 ? n : null;
};

export async function GET(_req, { params }) {
  const tmdbId = idOf(params);
  if (!tmdbId) return fail("Invalid movie", 400);
  const user = await getCurrentUser();
  await connectDB();
  const rows = await Review.find({ tmdbId, hidden: false }).sort({ createdAt: -1 }).limit(30).lean();
  const count = rows.length;
  const avg = count ? Math.round((rows.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10 : 0;
  return ok({
    avg,
    count,
    reviews: rows.map((r) => ({
      id: String(r._id),
      username: r.username,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      mine: user && !user.isAdmin && String(r.userId) === user.id,
    })),
  });
}

export async function POST(req, { params }) {
  const tmdbId = idOf(params);
  const { user, error } = await requireUser();
  if (error) return fail(error.message, error.status);
  if (!tmdbId) return fail("Invalid movie", 400);
  if (user.isAdmin) return fail("Admins can't post reviews", 400);
  if (!rateLimit(`rev:${user.id}`, 20, 60 * 60 * 1000).ok) return fail("Slow down a little", 429);
  const b = await readJson(req);
  const rating = Number(b.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return fail("Pick a rating from 1 to 5", 400);
  await connectDB();
  const u = await User.findById(user.id).select("username status");
  await Review.findOneAndUpdate(
    { tmdbId, userId: user.id },
    { rating, comment: String(b.comment || "").trim().slice(0, 500), username: u.username || "member", movieTitle: String(b.title || "").slice(0, 200), hidden: false },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return ok({ message: "Thanks for rating" });
}

export async function DELETE(_req, { params }) {
  const tmdbId = idOf(params);
  const { user, error } = await requireUser();
  if (error) return fail(error.message, error.status);
  await connectDB();
  await Review.deleteOne({ tmdbId, userId: user.id });
  return ok();
}
