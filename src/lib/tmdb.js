// Server-only TMDB helpers. TMDB's API is free (non-commercial use) — https://www.themoviedb.org/settings/api
import { CERT_ORDER, mapGbCert } from "./age";

const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p";
const HOUR = 3600;

async function tmdb(path, params = {}, revalidate = HOUR) {
  const url = new URL(BASE + path);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
  });
  const headers = { accept: "application/json" };
  const token = process.env.TMDB_API_TOKEN || process.env.API_BEARIER;
  if (token) headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  else if (process.env.TMDB_API_KEY) url.searchParams.set("api_key", process.env.TMDB_API_KEY);
  else throw new Error("TMDB credentials missing (set TMDB_API_TOKEN)");
  const res = await fetch(url, { headers, next: { revalidate } });
  if (!res.ok) {
    const e = new Error(`TMDB ${res.status} on ${path}`);
    e.status = res.status;
    throw e;
  }
  return res.json();
}

export const img = (path, size = "w500") => (path ? `${IMG}/${size}${path}` : null);
export const todayISO = () => new Date().toISOString().slice(0, 10);
const plusDaysISO = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);

const isReleased = (status, date) => status === "Released" || Boolean(date && date <= todayISO() && status !== "Canceled");

// ── normalisers ────────────────────────────────────────────────────────────
export function normalizeListItem(m) {
  const date = m.release_date || "";
  return {
    id: m.id,
    key: String(m.id),
    href: `/movies/${m.id}`,
    title: m.title,
    original_title: m.original_title,
    overview: m.overview || "",
    release_date: date,
    year: date ? date.slice(0, 4) : "",
    poster: img(m.poster_path),
    backdrop: img(m.backdrop_path, "w1280"),
    genreIds: m.genre_ids || (m.genres || []).map((g) => g.id),
    adult: Boolean(m.adult),
    rating: m.vote_average ? Math.round(m.vote_average * 10) / 10 : 0,
    released: isReleased(m.status, date),
  };
}

function pickCertification(rd, preferred = "US") {
  const results = rd?.results || [];
  const find = (code) => {
    const entry = results.find((r) => r.iso_3166_1 === code);
    const c = entry?.release_dates?.map((x) => x.certification).find(Boolean);
    return c || "";
  };
  const us = find(preferred);
  if (CERT_ORDER.includes(us)) return us;
  return mapGbCert(find("GB")) || "";
}

export function pickTrailers(videos) {
  const yt = (videos?.results || []).filter((v) => v.site === "YouTube");
  const rank = (a, b) => Number(b.official) - Number(a.official) || new Date(b.published_at) - new Date(a.published_at);
  let list = yt.filter((v) => v.type === "Trailer").sort(rank);
  if (!list.length) list = yt.filter((v) => v.type === "Teaser").sort(rank);
  return list.slice(0, 4).map((v) => ({ id: v.id, key: v.key, name: v.name }));
}

export function normalizeMovie(d) {
  const base = normalizeListItem(d);
  return {
    ...base,
    imdbId: d.imdb_id || "",
    tagline: d.tagline || "",
    runtime: d.runtime || 0,
    status: d.status,
    certification: pickCertification(d.release_dates),
    backdrops: (d.images?.backdrops || []).slice(0, 12).map((b) => img(b.file_path, "w780")),
    genres: d.genres || [],
    companies: (d.production_companies || [])
      .filter((c) => c.logo_path)
      .map((c) => ({ id: c.id, name: c.name, logo: img(c.logo_path, "w200") })),
    cast: (d.credits?.cast || []).slice(0, 10).map((c) => c.name),
    trailers: pickTrailers(d.videos),
    providers: d["watch/providers"]?.results || {},
    recommendations: (d.recommendations?.results || []).map(normalizeListItem),
  };
}

// ── detail / lists ─────────────────────────────────────────────────────────
export async function getGenres() {
  const data = await tmdb("/genre/movie/list", { language: "en" }, 86400);
  return data.genres;
}

export async function getMovieDetail(id) {
  const d = await tmdb(`/movie/${id}`, {
    language: "en-US",
    append_to_response: "images,videos,credits,release_dates,watch/providers,recommendations",
    include_image_language: "en,null",
  });
  return normalizeMovie(d);
}

// Build discover params that enforce the viewer's age tier at the API level.
function discoverParams(tier, o = {}) {
  const p = {
    include_adult: "false",
    include_video: "false",
    language: "en-US",
    page: o.page || 1,
    sort_by: o.sort || "popularity.desc",
  };
  if (!o.upcoming && tier.maxCert) {
    p.certification_country = "US";
    p["certification.lte"] = tier.maxCert;
  }
  // genres: a user-picked genre (AND) or taste genres (OR), constrained by the tier
  let genres = o.genre ? [Number(o.genre)] : o.anyGenres?.length ? o.anyGenres.map(Number) : null;
  if (tier.onlyGenres) {
    genres = genres ? genres.filter((g) => tier.onlyGenres.includes(g)) : [];
    if (!genres.length) genres = tier.onlyGenres;
    p.with_genres = genres.join("|");
  } else if (genres) {
    p.with_genres = genres.join(o.genre ? "," : "|");
  }
  if (tier.excludeGenres.length) p.without_genres = tier.excludeGenres.join(",");
  if (o.upcoming) {
    p["primary_release_date.gte"] = todayISO();
    p["primary_release_date.lte"] = plusDaysISO(150);
  }
  if (o.minVotes) p["vote_count.gte"] = o.minVotes;
  if (o.originCountry) p.with_origin_country = o.originCountry;
  if (o.sort === "primary_release_date.desc") p["primary_release_date.lte"] = todayISO();
  return p;
}

export async function discoverMovies(tier, opts = {}) {
  const data = await tmdb("/discover/movie", discoverParams(tier, opts));
  return {
    items: data.results.map(normalizeListItem),
    totalPages: Math.min(data.total_pages || 1, 500),
  };
}

export async function searchMovies(query, page = 1) {
  const data = await tmdb("/search/movie", { query, include_adult: "false", page, language: "en-US" });
  return { items: data.results.map(normalizeListItem), totalPages: Math.min(data.total_pages || 1, 50) };
}

// Used to link Internet Archive films to TMDB metadata.
export async function findByTitleYear(title, year) {
  try {
    const data = await tmdb("/search/movie", { query: title, include_adult: "false", language: "en-US" }, 86400);
    const n = (s) => String(s || "").toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z0-9]+/g, " ").trim();
    const want = n(title);
    const hit = (data.results || []).slice(0, 6).find((m) => {
      const y = m.release_date ? Number(m.release_date.slice(0, 4)) : null;
      const yearOk = !year || !y || Math.abs(y - Number(year)) <= 1;
      return yearOk && (n(m.title) === want || n(m.original_title) === want);
    });
    return hit ? normalizeListItem(hit) : null;
  } catch {
    return null;
  }
}

// Best-effort "where to watch" for the viewer's country (TMDB data, powered by JustWatch).
export function providersFor(movie, country) {
  const p = movie.providers?.[country];
  if (!p) return null;
  const pick = (arr) => (arr || []).slice(0, 6).map((x) => ({ id: x.provider_id, name: x.provider_name, logo: img(x.logo_path, "w92") }));
  const out = { link: p.link, stream: pick(p.flatrate), rent: pick(p.rent), buy: pick(p.buy) };
  return out.stream.length || out.rent.length || out.buy.length ? out : null;
}
