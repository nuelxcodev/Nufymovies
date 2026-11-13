import { getCurrentUser } from "@/lib/session";
import { browse, genresFor } from "@/lib/catalog";
import { ok, fail, clampInt } from "@/lib/http";

// Age-filtered movie list. GET /api/movies?page=&genre=&sort=
export async function GET(req) {
  const user = await getCurrentUser();
  if (!user) return fail("Please sign in", 401);
  const sp = req.nextUrl.searchParams;
  try {
    const [genres, data] = await Promise.all([
      genresFor(user.tier),
      browse(user, { page: clampInt(sp.get("page"), 1, 500, 1), genre: sp.get("genre") || undefined }),
    ]);
    return ok({ movies: data.items, genres, totalPages: data.totalPages });
  } catch (e) {
    return fail(e.message, 500);
  }
}
