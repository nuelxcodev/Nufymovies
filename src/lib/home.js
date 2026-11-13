import { getFreeLibrary } from "./archive";
import { applyOverrides, browse, filterByAge, tasteGenres, isFinished } from "./catalog";
import { getOverrides } from "./overrides";
import { getMovieDetail, getGenres } from "./tmdb";
import { getSettings } from "./settings";
import { countryName } from "./countries";
import { isAllowed } from "./age";

const safe = (p, fallback) => p.catch(() => fallback);

export async function getHomeData(user) {
  const settings = await getSettings();
  const taste = tasteGenres(user);
  const seen = new Set([...(user.history || []), ...(user.watchlist || [])].map((e) => e.key));

  const [popular, taste_, topRated, local, upcoming, free, genres] = await Promise.all([
    safe(browse(user, {}), { items: [] }),
    taste.length ? safe(browse(user, { anyGenres: taste, page: 1 }), { items: [] }) : { items: [] },
    safe(browse(user, { sort: "vote_average.desc", minVotes: 1500 }), { items: [] }),
    user.country ? safe(browse(user, { originCountry: user.country }), { items: [] }) : { items: [] },
    safe(browse(user, { upcoming: true }), { items: [] }),
    settings.freeLibraryEnabled ? safe(getFreeLibrary({ rows: 16 }), { items: [] }) : { items: [] },
    safe(getGenres(), []),
  ]);

  const freeItems = (await safe(filterByAge(free.items, user), [])).slice(0, 12);

  // Hero: admin-featured titles first, then the most popular.
  let featured = [];
  const ov = await getOverrides();
  const ids = [...ov.values()].filter((o) => o.featured && !o.hidden).map((o) => o.tmdbId).slice(0, 4);
  if (ids.length) {
    const details = await Promise.all(ids.map((id) => safe(getMovieDetail(id), null)));
    featured = (await applyOverrides(details.filter(Boolean), user)).filter((m) => m.backdrop);
    featured = featured.filter((m) => isAllowed(m, user.tier));
  }
  const hero = [...featured, ...popular.items.filter((m) => m.backdrop && !featured.some((f) => f.id === m.id))].slice(0, 8);

  const continueWatching = (user.history || []).filter((h) => !isFinished(h)).slice(0, 12);
  const tasteTitle = taste.length ? "Picked for you" : null;
  const fresh = (list) => list.filter((m) => !seen.has(m.key));

  return {
    genres,
    hero,
    shelves: [
      continueWatching.length && { id: "continue", title: "Continue watching", items: continueWatching, progress: true },
      freeItems.length && { id: "free", title: "Free to watch and download", href: "/free", items: freeItems, free: true },
      tasteTitle && fresh(taste_.items).length >= 4 && { id: "taste", title: tasteTitle, items: fresh(taste_.items) },
      local.items.length >= 6 && { id: "local", title: `Made in ${countryName(user.country)}`, items: local.items },
      { id: "popular", title: "Popular right now", href: "/browse", items: popular.items },
      upcoming.items.length >= 4 && { id: "soon", title: "Coming soon", href: "/coming-soon", items: upcoming.items },
      topRated.items.length && { id: "top", title: "Top rated", href: "/browse?sort=vote_average.desc", items: topRated.items },
    ].filter(Boolean),
  };
}
