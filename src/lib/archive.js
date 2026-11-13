// Internet Archive: free, keyless API with a large catalogue of public-domain / openly licensed films
// that can be streamed AND downloaded legally. https://archive.org/developers/
import { findByTitleYear } from "./tmdb";

const SEARCH = "https://archive.org/advancedsearch.php";
const META = "https://archive.org/metadata";

// Curated Archive collections (public-domain focus). Deliberately excludes the open "community video" pool.
const COLLECTIONS = ["feature_films", "silent_films", "film_noir", "SciFi_Horror", "comedy_films", "classic_cartoons", "animationandcartoons"];
const COLLECTION_CLAUSE = `(${COLLECTIONS.map((c) => `collection:${c}`).join(" OR ")})`;
const BASE_CLAUSE = `${COLLECTION_CLAUSE} AND mediatype:movies AND NOT access-restricted-item:true`;

export const isArchiveId = (s) => typeof s === "string" && /^[A-Za-z0-9._-]{2,200}$/.test(s);
export const archiveThumb = (id) => `https://archive.org/services/img/${id}`;
export const isCurated = (item) => Boolean(item?.collections?.some((c) => COLLECTIONS.includes(c)));
const archiveUrl = (id) => `https://archive.org/details/${id}`;
const escapeQ = (s) => String(s).replace(/["\\]/g, " ").trim();
const norm = (s) => String(s || "").toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z0-9]+/g, " ").trim();

async function aj(url, revalidate) {
  try {
    const res = await fetch(url, { next: { revalidate }, signal: AbortSignal.timeout(9000) });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

function searchUrl(q, { rows = 10, page = 1, sort = "downloads desc" } = {}) {
  const u = new URL(SEARCH);
  u.searchParams.set("q", q);
  ["identifier", "title", "year", "downloads"].forEach((f) => u.searchParams.append("fl[]", f));
  u.searchParams.set("sort[]", sort);
  u.searchParams.set("rows", rows);
  u.searchParams.set("page", page);
  u.searchParams.set("output", "json");
  return u.toString();
}

const asYear = (y) => (Array.isArray(y) ? y[0] : y) || "";

// Find a free copy for a TMDB movie. Requires an exact title match (and year within ±1).
export async function findFreeCopy(title, year, originalTitle) {
  const names = [...new Set([title, originalTitle].filter(Boolean))];
  for (const name of names) {
    const data = await aj(searchUrl(`title:"${escapeQ(name)}" AND ${BASE_CLAUSE}`, { rows: 8 }), 86400);
    const docs = data?.response?.docs || [];
    const hit = docs.find((d) => {
      const y = Number(asYear(d.year));
      const yearOk = !year || !y || Math.abs(y - Number(year)) <= 1;
      return yearOk && norm(d.title) === norm(name);
    });
    if (hit) return hit.identifier;
  }
  return null;
}

export async function searchArchive(q, rows = 8) {
  if (!q?.trim()) return [];
  const data = await aj(searchUrl(`title:(${escapeQ(q)}) AND ${BASE_CLAUSE}`, { rows }), 3600);
  return (data?.response?.docs || []).map((d) => ({ id: d.identifier, title: d.title, year: asYear(d.year) }));
}

const human = (b) => {
  const n = Number(b);
  if (!n) return "";
  if (n > 1e9) return `${(n / 1e9).toFixed(1)} GB`;
  return `${Math.max(1, Math.round(n / 1e6))} MB`;
};
const encPath = (p) => p.split("/").map(encodeURIComponent).join("/");

// Playable + downloadable files for one Archive item.
export async function getArchiveItem(id) {
  if (!isArchiveId(id)) return null;
  const d = await aj(`${META}/${id}`, 3600);
  if (!d?.files?.length || d.is_dark) return null;
  const md = d.metadata || {};
  if (md.mediatype !== "movies" || md["access-restricted-item"] === "true") return null;

  const vids = d.files
    .filter((f) => /\.(mp4|m4v|ogv)$/i.test(f.name))
    .filter((f, i, arr) => arr.findIndex((x) => x.name === f.name) === i)
    .map((f) => ({
      name: f.name,
      format: f.format || "",
      bytes: Number(f.size) || 0,
      ext: f.name.split(".").pop().toLowerCase(),
    }))
    .filter((f) => f.bytes > 5e5);
  if (!vids.length) return null;

  const mp4 = vids.filter((f) => f.ext === "mp4" || f.ext === "m4v");
  const pool = mp4.length ? mp4 : vids;
  const stream = pool.find((f) => f.format === "h.264") || pool.find((f) => f.format === "MPEG4") || [...pool].sort((a, b) => a.bytes - b.bytes)[0];

  const sorted = [...pool].sort((a, b) => a.bytes - b.bytes).slice(0, 4);
  const files = sorted.map((f, i) => ({
    name: f.name,
    url: `https://archive.org/download/${id}/${encPath(f.name)}`,
    size: human(f.bytes),
    label: sorted.length === 1 ? "Download" : i === 0 ? "Data saver" : i === sorted.length - 1 ? "Best quality" : "Standard",
    ext: f.ext.toUpperCase(),
  }));

  return {
    id,
    title: Array.isArray(md.title) ? md.title[0] : md.title || id,
    streamUrl: `https://archive.org/download/${id}/${encPath(stream.name)}`,
    streamType: stream.ext === "ogv" ? "video/ogg" : "video/mp4",
    files,
    collections: [].concat(md.collection || []),
    sourceUrl: archiveUrl(id),
    license: md.licenseurl || "",
    thumb: archiveThumb(id),
  };
}

// For a TMDB movie: admin-pinned id > ?src= hint > automatic exact-title match.
// A hint comes from the URL, so it must be a curated-collection item whose title matches the movie.
export async function resolveFree(movie, { pinned, hint } = {}) {
  if (!movie.released) return null;
  if (isArchiveId(pinned)) {
    const item = await getArchiveItem(pinned);
    if (item) return item;
  }
  if (isArchiveId(hint)) {
    const item = await getArchiveItem(hint);
    const names = [movie.title, movie.original_title].map(norm);
    if (item && isCurated(item) && names.includes(norm(item.title))) return item;
  }
  const id = await findFreeCopy(movie.title, movie.year, movie.original_title);
  return id ? getArchiveItem(id) : null;
}

// Free Library shelf: popular public-domain films, enriched with TMDB posters + ratings.
export async function getFreeLibrary({ page = 1, rows = 24, sort = "downloads desc" } = {}) {
  const data = await aj(searchUrl(BASE_CLAUSE, { rows, page, sort }), 21600);
  const docs = data?.response?.docs || [];
  const total = data?.response?.numFound || 0;
  const items = await Promise.all(
    docs.map(async (d) => {
      const year = asYear(d.year);
      const tm = await findByTitleYear(d.title, year);
      return {
        key: tm ? String(tm.id) : `ia:${d.identifier}`,
        archiveId: d.identifier,
        tmdbId: tm?.id || null,
        href: tm ? `/movies/${tm.id}?src=${encodeURIComponent(d.identifier)}` : `/free/${d.identifier}`,
        title: tm?.title || d.title,
        year: tm?.year || String(year || ""),
        poster: tm?.poster || archiveThumb(d.identifier),
        backdrop: tm?.backdrop || null,
        genreIds: tm?.genreIds || [],
        adult: tm?.adult || false,
        released: true,
        release_date: tm?.release_date || "",
        rating: tm?.rating || 0,
        overview: tm?.overview || "",
        free: true,
      };
    })
  );
  return { items, totalPages: Math.max(1, Math.min(Math.ceil(total / rows), 100)) };
}
