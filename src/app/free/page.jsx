import Card from "@/components/Card";
import Pager from "@/components/Pager";
import { requirePageUser } from "@/lib/session";
import { getFreeLibrary } from "@/lib/archive";
import { filterByAge } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { clampInt } from "@/lib/http";

export const metadata = { title: "Free library" };

const SORTS = { "downloads desc": "Most watched", "addeddate desc": "Recently added" };

export default async function FreePage({ searchParams }) {
  const user = await requirePageUser();
  const settings = await getSettings();
  const page = clampInt(searchParams.page, 1, 100, 1);
  const sort = SORTS[searchParams.sort] ? searchParams.sort : "downloads desc";
  const lib = settings.freeLibraryEnabled ? await getFreeLibrary({ page, sort }) : { items: [], totalPages: 1 };
  const items = await filterByAge(lib.items, user);
  const q = (p, s = sort) => `/free?${new URLSearchParams({ page: p, ...(s !== "downloads desc" ? { sort: s } : {}) })}`;

  return (
    <main className="page pt-24">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-4xl font-extrabold md:text-5xl">Free library</h1>
        <div className="flex gap-2" role="group" aria-label="Sort">
          {Object.entries(SORTS).map(([k, l]) => <a key={k} href={q(1, k)} aria-current={sort === k} className={`chip px-3 py-1.5 text-sm ${sort === k ? "chip-brand" : ""}`}>{l}</a>)}
        </div>
      </div>
      <p className="mb-8 max-w-2xl text-muted">Full-length films from public-domain collections. Press play, or download one to watch offline. Titles are filtered to your age.</p>
      {!settings.freeLibraryEnabled ? (
        <p className="text-muted">The free library is paused right now.</p>
      ) : items.length === 0 ? (
        <p className="text-muted">No films to show on this page for your age group. Try the next page.</p>
      ) : (
        <div className="poster-grid">{items.map((m) => <Card key={m.key} movie={m} />)}</div>
      )}
      <Pager page={page} totalPages={lib.totalPages} hrefFor={q} />
    </main>
  );
}
