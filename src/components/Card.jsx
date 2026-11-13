import Link from "next/link";
import ListButton from "./ListButton";

const fmtDate = (d) => (d ? new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "");

// Poster card (2:3) or, with `landscape`, a 16:9 continue-watching card with a progress bar.
export default function Card({ movie, landscape = false }) {
  const image = landscape ? movie.backdrop || movie.poster : movie.poster;
  if (!image) return null;
  const upcoming = movie.released === false;
  const pct = movie.duration ? Math.min(100, Math.round((movie.position / movie.duration) * 100)) : 0;
  const item = {
    key: movie.key,
    href: movie.href,
    title: movie.title,
    poster: movie.poster,
    year: movie.year,
    genreIds: movie.genreIds,
    releaseDate: movie.release_date || movie.releaseDate || "",
  };

  return (
    <div className="group relative">
      <Link href={movie.href} className="block" aria-label={movie.title}>
        <div className={`relative overflow-hidden rounded-lg bg-surface2 ring-1 ring-line transition duration-200 group-hover:ring-brand ${landscape ? "aspect-video" : "aspect-[2/3]"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
          {movie.free && <span className="chip chip-good absolute left-2 top-2 bg-black/70 text-good backdrop-blur">Free</span>}
          {upcoming && <span className="chip absolute left-2 top-2 bg-black/70 text-brand backdrop-blur">Soon</span>}
          {landscape && pct > 0 && (
            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/25">
              <div className="h-full bg-brand" style={{ width: `${pct}%` }} />
            </div>
          )}
        </div>
        <div className="mt-2 px-0.5">
          <h3 className="line-clamp-1 text-sm font-semibold">{movie.title}</h3>
          <p className="text-xs text-muted">
            {upcoming && movie.release_date
              ? `Out ${fmtDate(movie.release_date)}`
              : [movie.year, movie.rating ? `★ ${movie.rating}` : null].filter(Boolean).join("  ·  ")}
          </p>
        </div>
      </Link>
      {!landscape && <ListButton item={item} remind={upcoming} className="absolute right-2 top-2" />}
    </div>
  );
}
