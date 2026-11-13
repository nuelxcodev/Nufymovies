import { BiSearch } from "react-icons/bi";
import Card from "@/components/Card";
import Pager from "@/components/Pager";
import { requirePageUser } from "@/lib/session";
import { search } from "@/lib/catalog";
import { clampInt } from "@/lib/http";

export const metadata = { title: "Search" };

export default async function SearchPage({ searchParams }) {
  const user = await requirePageUser();
  const q = String(searchParams.q || "").trim().slice(0, 80);
  const page = clampInt(searchParams.page, 1, 50, 1);
  let data = { items: [], totalPages: 1 };
  let failed = false;
  if (q) {
    try {
      data = await search(user, q, page);
    } catch {
      failed = true;
    }
  }

  return (
    <main className="page pt-24">
      <h1 className="mb-5 text-4xl font-extrabold">Search</h1>
      <form action="/search" className="relative mb-8 max-w-xl">
        <label htmlFor="q" className="sr-only">Movie title</label>
        <BiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={20} />
        <input id="q" name="q" defaultValue={q} placeholder="Search by title" className="input py-3 pl-11" autoFocus={!q} />
      </form>
      {!q && <p className="text-muted">Type a title to find films, trailers and free-to-watch classics.</p>}
      {failed && <p className="text-muted">Search is unavailable right now. Try again in a moment.</p>}
      {q && !failed && data.items.length === 0 && <p className="text-muted">No results for “{q}” in your catalogue. Check the spelling or try fewer words.</p>}
      {data.items.length > 0 && <div className="poster-grid">{data.items.map((m) => <Card key={m.key} movie={m} />)}</div>}
      <Pager page={page} totalPages={data.totalPages} hrefFor={(p) => `/search?q=${encodeURIComponent(q)}&page=${p}`} />
    </main>
  );
}
