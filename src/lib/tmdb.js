// Server-only TMDB helpers (replaces nufy_server/utils/movie_datas_api.js + dataobjects.js)
const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p";

function authHeader() {
  const raw = process.env.TMDB_API_TOKEN || process.env.API_BEARIER || "";
  return raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;
}

async function tmdb(path, params = {}) {
  const url = new URL(BASE + path);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
  });
  const res = await fetch(url, {
    headers: { accept: "application/json", Authorization: authHeader() },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`TMDB ${res.status} on ${path}`);
  return res.json();
}

export const img = (path, size = "w500") => (path ? `${IMG}/${size}${path}` : null);

export function pickTrailers(videos) {
  const list = (videos?.results || []).filter(
    (v) => v.site === "YouTube" && v.type === "Trailer"
  );
  list.sort(
    (a, b) =>
      Number(b.official) - Number(a.official) ||
      new Date(b.published_at) - new Date(a.published_at)
  );
  return list.map((v) => ({ id: v.id, key: v.key, name: v.name }));
}

export function normalizeMovie(d) {
  return {
    id: d.id,
    title: d.title,
    original_title: d.original_title,
    overview: d.overview,
    release_date: d.release_date,
    year: d.release_date ? d.release_date.slice(0, 4) : "",
    runtime: d.runtime,
    status: d.status,
    poster: img(d.poster_path),
    backdrop: img(d.backdrop_path, "w1280"),
    backdrops: (d.images?.backdrops || []).slice(0, 12).map((b) => img(b.file_path, "w780")),
    genres: d.genres || [],
    companies: (d.production_companies || [])
      .filter((c) => c.logo_path)
      .map((c) => ({ id: c.id, name: c.name, logo: img(c.logo_path, "w200") })),
    cast: (d.credits?.cast || []).slice(0, 10).map((c) => c.name),
    trailers: pickTrailers(d.videos),
  };
}

export async function getGenres() {
  const data = await tmdb("/genre/movie/list", { language: "en" });
  return data.genres;
}

export async function getMovieDetail(id) {
  const d = await tmdb(`/movie/${id}`, {
    language: "en-US",
    append_to_response: "images,videos,credits",
    include_image_language: "en,null",
  });
  return normalizeMovie(d);
}

// 1 discover call + 1 detail call per movie (append_to_response folds images,
// videos and credits into one request instead of the 3 the old Express server made).
export async function getMovies({ page = 1, genre } = {}) {
  const list = await tmdb("/discover/movie", {
    include_adult: "false",
    include_video: "false",
    language: "en-US",
    page,
    sort_by: "popularity.desc",
    with_genres: genre,
  });
  const movies = await Promise.all(list.results.map((m) => getMovieDetail(m.id)));
  return { movies, totalPages: Math.min(list.total_pages, 500) };
}
