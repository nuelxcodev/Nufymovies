// Age + admin-rule filtering shared by every list in the app.
import { getMovieDetail, discoverMovies, getGenres, searchMovies, todayISO } from "./tmdb";
import { getOverrides } from "./overrides";
import { isAllowed, GENRE } from "./age";

// Drop admin-hidden titles and titles whose admin min-age is above the viewer's age.
export async function applyOverrides(items, user) {
  if (user?.isAdmin) return items;
  const ov = await getOverrides();
  if (!ov.size) return items;
  return items.filter((m) => {
    const id = m.tmdbId ?? m.id;
    const o = id ? ov.get(Number(id)) : null;
    return !o || (!o.hidden && !(o.minAge && (user?.age || 0) < o.minAge));
  });
}

// For lists where TMDB can't filter by certification (search, recommendations, free library):
// look up each film's certification (cached 1h) and apply the viewer's tier.
export async function filterByAge(items, user) {
  const base = await applyOverrides(items, user);
  const tier = user.tier;
  if (tier.adult) return base.filter((m) => !m.adult);
  const checked = await Promise.all(
    base.map(async (m) => {
      if (m.adult) return null;
      const id = m.tmdbId ?? m.id;
      if (!id) return null; // no TMDB match → can't verify the rating → hidden from minors
      try {
        const d = await getMovieDetail(id);
        return isAllowed(d, tier) ? m : null;
      } catch {
        return null;
      }
    })
  );
  return checked.filter(Boolean);
}

// Genre list shown to this viewer.
export async function genresFor(tier) {
  const all = await getGenres().catch(() => []);
  return all.filter((g) => (tier.onlyGenres ? tier.onlyGenres.includes(g.id) : !tier.excludeGenres.includes(g.id)));
}

export async function browse(user, opts) {
  const r = await discoverMovies(user.tier, opts);
  return { ...r, items: await applyOverrides(r.items, user) };
}

export async function search(user, q, page) {
  const r = await searchMovies(q, page);
  return { ...r, items: await filterByAge(r.items, user) };
}

// Top genres from what the viewer has watched / saved.
export function tasteGenres(user, n = 2) {
  const counts = new Map();
  [...(user.history || []), ...(user.watchlist || [])].forEach((e) =>
    (e.genreIds || []).forEach((g) => counts.set(g, (counts.get(g) || 0) + 1))
  );
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([g]) => g);
}

export const isFinished = (h) => h.duration && h.position / h.duration > 0.95;
export { todayISO, GENRE };
