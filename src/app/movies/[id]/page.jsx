import Link from "next/link";
import { notFound } from "next/navigation";
import WatchPanel from "@/components/WatchPanel";
import ListButton from "@/components/ListButton";
import ShareButton from "@/components/ShareButton";
import ReportButton from "@/components/ReportButton";
import Reviews from "@/components/Reviews";
import Shelf from "@/components/Shelf";
import Card from "@/components/Card";
import { requirePageUser } from "@/lib/session";
import { getMovieDetail, providersFor } from "@/lib/tmdb";
import { resolveFree } from "@/lib/archive";
import { getOverrides } from "@/lib/overrides";
import { getSettings } from "@/lib/settings";
import { filterByAge } from "@/lib/catalog";
import { isAllowed } from "@/lib/age";
import { countryName } from "@/lib/countries";

export async function generateMetadata({ params }) {
  try {
    const m = await getMovieDetail(params.id);
    return { title: m.title, description: m.overview };
  } catch {
    return { title: "Movie" };
  }
}

function Blocked() {
  return (
    <main className="page pt-32 text-center">
      <h1 className="text-3xl font-extrabold">Not available for your age group</h1>
      <p className="mx-auto mt-3 max-w-md text-muted">This film is rated above what&apos;s set for your account, so we can&apos;t show it.</p>
      <Link href="/browse" className="btn btn-primary mt-6">Browse films for you</Link>
    </main>
  );
}

export default async function MoviePage({ params, searchParams }) {
  const user = await requirePageUser();
  let movie;
  try {
    movie = await getMovieDetail(params.id);
  } catch {
    notFound();
  }

  const ov = (await getOverrides()).get(movie.id);
  if (!user.isAdmin) {
    if (ov?.hidden) notFound();
    if (ov?.minAge && (user.age || 0) < ov.minAge) return <Blocked />;
    if (!isAllowed(movie, user.tier)) return <Blocked />;
  }

  const settings = await getSettings();
  const free = settings.freeLibraryEnabled ? await resolveFree(movie, { pinned: ov?.archiveId, hint: searchParams.src }) : null;
  const providers = !free && movie.released ? providersFor(movie, user.country) : null;
  const daysUntil = !movie.released && movie.release_date ? Math.max(0, Math.ceil((new Date(movie.release_date) - Date.now()) / 864e5)) : 0;
  const progress = user.history.find((h) => h.key === movie.key);
  const related = await filterByAge(movie.recommendations.filter((m) => m.poster).slice(0, 14), user);

  const panelMovie = {
    key: movie.key, href: movie.href, title: movie.title, poster: movie.poster, backdrop: movie.backdrop,
    genreIds: movie.genreIds, releaseDate: movie.release_date, year: movie.year,
  };
  const listItem = { key: movie.key, href: movie.href, title: movie.title, poster: movie.poster, year: movie.year, genreIds: movie.genreIds, releaseDate: movie.release_date };
  const meta = [movie.year, movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : null, movie.rating ? `★ ${movie.rating}` : null].filter(Boolean);

  return (
    <main className="pt-20 md:pt-24">
      <div className="page grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <WatchPanel
          movie={panelMovie}
          free={free}
          trailers={movie.trailers}
          released={movie.released}
          daysUntil={daysUntil}
          downloadsEnabled={settings.downloadsEnabled}
          providers={providers}
          countryName={countryName(user.country)}
          startAt={progress?.position || 0}
        />

        <div>
          <h1 className="text-3xl font-extrabold md:text-4xl">{movie.title}</h1>
          {movie.tagline && <p className="mt-1 text-muted">{movie.tagline}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted">
            {movie.certification && <span className="rounded border border-line px-1.5 py-0.5 text-xs font-semibold text-ink">{movie.certification}</span>}
            {meta.map((m, i) => <span key={i}>{m}</span>)}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">{movie.genres.map((g) => <span key={g.id} className="chip">{g.name}</span>)}</div>
          <p className="mt-5 leading-relaxed">{movie.overview || "No synopsis available yet."}</p>
          {movie.cast.length > 0 && <p className="mt-4 text-sm text-muted"><b className="text-ink">Cast</b> {movie.cast.join(", ")}</p>}

          <div className="mt-6 flex flex-wrap gap-2">
            {movie.released && <ListButton item={listItem} variant="button" />}
            <ShareButton title={movie.title} />
            <ReportButton item={panelMovie} />
          </div>

          {user.isAdmin && ov && (
            <p className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="chip chip-brand">Admin rules</span>
              {ov.hidden && <span className="chip">Hidden</span>}
              {ov.featured && <span className="chip">Featured</span>}
              {ov.minAge > 0 && <span className="chip">Min age {ov.minAge}</span>}
              {ov.archiveId && <span className="chip">Pinned stream</span>}
            </p>
          )}

          {movie.companies.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-4 rounded-lg bg-white p-3">
              {movie.companies.slice(0, 5).map((c) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={c.id} src={c.logo} alt={c.name} className="h-7 w-auto object-contain" />
              ))}
            </div>
          )}
        </div>
      </div>

      <Reviews tmdbId={movie.id} title={movie.title} />

      {movie.backdrops.length > 1 && (
        <section className="page mt-12" aria-label="Stills">
          <h2 className="mb-3 text-xl font-bold md:text-2xl">Stills</h2>
          <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 md:-mx-6 md:px-6">
            {movie.backdrops.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt="" loading="lazy" className="h-44 shrink-0 rounded-lg" />
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <Shelf title="More like this">{related.map((m) => <Card key={m.key} movie={m} />)}</Shelf>
      )}
    </main>
  );
}
