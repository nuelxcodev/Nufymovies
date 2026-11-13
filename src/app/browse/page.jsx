import Card from "@/components/Card";
import GenreSidebar from "@/components/GenreSidebar";
import Pager from "@/components/Pager";
import { requirePageUser } from "@/lib/session";
import { browse, genresFor } from "@/lib/catalog";
import { clampInt } from "@/lib/http";

export const metadata = { title: "Browse" };

const SORTS = {
  "popularity.desc": { label: "Popular", opts: {} },
  "vote_average.desc": { label: "Top rated", opts: { minVotes: 1000 } },
  "primary_release_date.desc": { label: "Newest", opts: { minVotes: 50 } },
};

export default async function BrowsePage({ searchParams }) {
  const user = await requirePageUser();
  const page = clampInt(searchParams.page, 1, 500, 1);
  const sort = SORTS[searchParams.sort] ? searchParams.sort : "popularity.desc";
  const genres = await genresFor(user.tier);
  const genre = genres.some((g) => String(g.id) === String(searchParams.genre)) ? searchParams.genre : undefined;

  let data = { items: [], totalPages: 1 };
  let failed = false;
  try {
    data = await browse(user, { page, genre, sort, ...SORTS[sort].opts });
  } catch {
    failed = true;
  }

  const hrefFor = (p) => {
    const q = new URLSearchParams();
    if (genre) q.set("genre", genre);
    if (sort !== "popularity.desc") q.set("sort", sort);
    q.set("page", p);
    return `/browse?${q}`;
  };
  const sortHref = (s) => `/browse?${new URLSearchParams({ ...(genre ? { genre } : {}), ...(s !== "popularity.desc" ? { sort: s } : {}) })}`;

  return (
    <main className="page pt-24">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-4xl font-extrabold md:text-5xl">Browse</h1>
        <div className="flex gap-2" role="group" aria-label="Sort">
          {Object.entries(SORTS).map(([k, s]) => (
            <a key={k} href={sortHref(k)} aria-current={sort === k} className={`chip px-3 py-1.5 text-sm ${sort === k ? "chip-brand" : ""}`}>{s.label}</a>
          ))}
        </div>
      </div>
      <div className="md:flex md:gap-8">
        <GenreSidebar genres={genres} activeId={genre} sort={sort !== "popularity.desc" ? sort : undefined} />
        <div className="min-w-0 flex-1">
          {failed ? (
            <p className="text-muted">Couldn&apos;t load movies right now. Refresh to try again.</p>
          ) : data.items.length === 0 ? (
            <p className="text-muted">Nothing here yet. Try another genre.</p>
          ) : (
            <div className="poster-grid">{data.items.map((m) => <Card key={m.key} movie={m} />)}</div>
          )}
          <Pager page={page} totalPages={data.totalPages} hrefFor={hrefFor} />
        </div>
      </div>
    </main>
  );
}
