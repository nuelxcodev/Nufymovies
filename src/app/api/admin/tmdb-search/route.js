import { searchMovies } from "@/lib/tmdb";
import { ok, fail } from "@/lib/http";
import { guard } from "../guard";

// Unfiltered by age on purpose: the admin needs to find any title to manage it.
export async function GET(req) {
  const denied = await guard();
  if (denied) return denied;
  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  if (q.length < 2) return ok({ items: [] });
  try {
    const { items } = await searchMovies(q, 1);
    return ok({ items: items.slice(0, 10).map(({ id, title, year, poster }) => ({ id, title, year, poster })) });
  } catch (e) {
    return fail(e.message, 502);
  }
}
