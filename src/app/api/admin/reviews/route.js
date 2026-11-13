import { Review } from "@/lib/models";
import { ok, clampInt } from "@/lib/http";
import { guard } from "@/lib/session";

export async function GET(req) {
  const denied = await guard();
  if (denied) return denied;
  const page = clampInt(req.nextUrl.searchParams.get("page"), 1, 1000, 1);
  const per = 25;
  const [total, rows] = await Promise.all([
    Review.countDocuments({}),
    Review.find({}).sort({ createdAt: -1 }).skip((page - 1) * per).limit(per).lean(),
  ]);
  return ok({
    pages: Math.max(1, Math.ceil(total / per)),
    reviews: rows.map((r) => ({ id: String(r._id), tmdbId: r.tmdbId, movieTitle: r.movieTitle, username: r.username, rating: r.rating, comment: r.comment, hidden: r.hidden, createdAt: r.createdAt })),
  });
}
