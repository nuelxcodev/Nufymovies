// Age-based content policy. One place to change the rules.
// TMDB certification order (US): G < PG < PG-13 < R < NC-17

export const GENRE = {
  Action: 28, Adventure: 12, Animation: 16, Comedy: 35, Crime: 80, Documentary: 99,
  Drama: 18, Family: 10751, Fantasy: 14, History: 36, Horror: 27, Music: 10402,
  Mystery: 9648, Romance: 10749, SciFi: 878, Thriller: 53, War: 10752, Western: 37,
};

export const CERT_ORDER = ["G", "PG", "PG-13", "R", "NC-17"];
export const certRank = (c) => CERT_ORDER.indexOf(c);

// Fallback when a film has no US certification but has a UK one.
const GB_TO_US = { U: "G", PG: "PG", "12": "PG-13", "12A": "PG-13", "15": "R", "18": "NC-17" };
export const mapGbCert = (c) => GB_TO_US[c] || "";

export const TIERS = {
  little: { key: "little", label: "Little ones (0–6)", maxCert: "G", onlyGenres: [GENRE.Animation, GENRE.Family], excludeGenres: [] },
  kids: { key: "kids", label: "Kids (7–12)", maxCert: "PG", onlyGenres: null, excludeGenres: [GENRE.Horror, GENRE.Thriller, GENRE.Crime, GENRE.War] },
  teen: { key: "teen", label: "Teen (13–15)", maxCert: "PG-13", onlyGenres: null, excludeGenres: [GENRE.Horror] },
  youngAdult: { key: "youngAdult", label: "Young adult (16–17)", maxCert: "PG-13", onlyGenres: null, excludeGenres: [] },
  adult: { key: "adult", label: "Adult (18+)", maxCert: null, onlyGenres: null, excludeGenres: [], adult: true },
};

export function tierFor(age) {
  const a = Number(age);
  if (!Number.isFinite(a) || a <= 0) return TIERS.kids; // unknown age → safe default
  if (a <= 6) return TIERS.little;
  if (a <= 12) return TIERS.kids;
  if (a <= 15) return TIERS.teen;
  if (a <= 17) return TIERS.youngAdult;
  return TIERS.adult;
}

// Film-level check. `movie` needs: adult, genreIds, certification, released, year.
export function isAllowed(movie, tier) {
  if (!movie || movie.adult) return false; // explicit content is never shown, for anyone
  if (tier.adult) return true;
  const g = movie.genreIds || [];
  if (tier.onlyGenres && !g.some((x) => tier.onlyGenres.includes(x))) return false;
  if (tier.excludeGenres.length && g.some((x) => tier.excludeGenres.includes(x))) return false;
  const rank = certRank(movie.certification);
  if (rank === -1) {
    // Unrated: allow only if unreleased (no cert exists yet) or pre-1968 (before the rating system).
    const preRatings = movie.year && Number(movie.year) < 1968;
    return !movie.released || Boolean(preRatings);
  }
  return rank <= certRank(tier.maxCert);
}

export const needsCertCheck = (tier) => !tier.adult;
