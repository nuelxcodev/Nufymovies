import { notFound } from "next/navigation";
import WatchPanel from "@/components/WatchPanel";
import ReportButton from "@/components/ReportButton";
import { requirePageUser } from "@/lib/session";
import { getArchiveItem, isArchiveId, isCurated } from "@/lib/archive";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Free film" };

// Archive-only titles (no TMDB match, so no verified age rating) are for adult accounts only.
export default async function FreeFilm({ params }) {
  const user = await requirePageUser();
  if (!isArchiveId(params.id)) notFound();
  if (!user.tier.adult) {
    return (
      <main className="page pt-28 text-center">
        <h1 className="text-3xl font-extrabold">Not available for your age group</h1>
        <p className="mx-auto mt-3 max-w-md text-muted">This title doesn&apos;t have a verified age rating yet, so it&apos;s only shown on adult accounts.</p>
      </main>
    );
  }
  const [item, settings] = await Promise.all([getArchiveItem(params.id), getSettings()]);
  if (!item || !isCurated(item)) notFound();
  const href = `/free/${item.id}`;
  const history = user.history.find((h) => h.key === `ia:${item.id}`);
  const movie = { key: `ia:${item.id}`, href, title: item.title, poster: item.thumb, backdrop: null, genreIds: [], releaseDate: "", year: "" };

  return (
    <main className="page max-w-5xl pt-24">
      <WatchPanel movie={movie} free={item} trailers={[]} released daysUntil={0} downloadsEnabled={settings.downloadsEnabled} providers={null} countryName="" startAt={history?.position || 0} tmdbBacked={false} />
      <h1 className="mt-6 text-3xl font-extrabold">{item.title}</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">View on Internet Archive</a>
        <ReportButton item={movie} />
      </div>
    </main>
  );
}
