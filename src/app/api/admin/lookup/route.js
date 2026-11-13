import { searchMovies } from "@/lib/tmdb";
import { searchArchive } from "@/lib/archive";
import { guard } from "@/lib/session";
import { ok, fail } from "@/lib/http";

// GET /api/admin/lookup?type=tmdb|archive&q=...  (unfiltered by age on purpose: the admin must find any title)
export async function GET(req) {
  const denied = await guard();
  if (denied) return denied;
  const sp = req.nextUrl.searchParams;
  const q = (sp.get("q") || "").trim();
  if (sp.get("type") === "archive") return ok({ items: await searchArchive(q, 8) });
  if (q.length < 2) return ok({ items: [] });
  try {
    const { items } = await searchMovies(q, 1);
    return ok({ items: items.slice(0, 10).map(({ id, title, year, poster }) => ({ id, title, year, poster })) });
  } catch (e) {
    return fail(e.message, 502);
  }
}
