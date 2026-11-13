import Card from "@/components/Card";
import Pager from "@/components/Pager";
import { requirePageUser } from "@/lib/session";
import { browse } from "@/lib/catalog";
import { clampInt } from "@/lib/http";

export const metadata = { title: "Coming soon" };

export default async function ComingSoon({ searchParams }) {
  const user = await requirePageUser();
  const page = clampInt(searchParams.page, 1, 50, 1);
  const data = await browse(user, { upcoming: true, page }).catch(() => ({ items: [], totalPages: 1 }));
  return (
    <main className="page pt-24">
      <h1 className="text-4xl font-extrabold md:text-5xl">Coming soon</h1>
      <p className="mb-8 mt-2 max-w-xl text-muted">Watch trailers now. Tap the bell on a poster and we&apos;ll flag it in My list the day it&apos;s out.</p>
      {data.items.length ? <div className="poster-grid">{data.items.map((m) => <Card key={m.key} movie={{ ...m, released: false }} />)}</div> : <p className="text-muted">No upcoming films to show right now.</p>}
      <Pager page={page} totalPages={data.totalPages} hrefFor={(p) => `/coming-soon?page=${p}`} />
    </main>
  );
}
