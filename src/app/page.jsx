import Branding from "@/components/Branding";
import Shelf from "@/components/Shelf";
import Card from "@/components/Card";
import Landing from "@/components/Landing";
import { getCurrentUser } from "@/lib/session";
import { getHomeData } from "@/lib/home";
import { discoverMovies } from "@/lib/tmdb";
import { TIERS } from "@/lib/age";

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    // Guests only ever see a G-rated, family-only preview.
    const preview = await discoverMovies(TIERS.little, {}).catch(() => ({ items: [] }));
    return <Landing posters={preview.items.map((m) => m.poster).filter(Boolean)} />;
  }

  const data = await getHomeData(user);
  if (!data.hero.length && !data.shelves.length) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center">
        <div>
          <h1 className="text-2xl font-bold">We couldn&apos;t load movies</h1>
          <p className="mt-2 text-muted">Check your connection and refresh. If you run this site: confirm TMDB_API_TOKEN is set.</p>
        </div>
      </main>
    );
  }
  const genreNames = Object.fromEntries(data.genres.map((g) => [g.id, g.name]));

  return (
    <main>
      <Branding movies={data.hero} genreNames={genreNames} />
      <div className="-mt-6">
        {data.shelves.map((s) => (
          <Shelf key={s.id} title={s.title} href={s.href} wide={s.progress}>
            {s.items.map((m) => <Card key={m.key} movie={m} landscape={Boolean(s.progress)} />)}
          </Shelf>
        ))}
      </div>
    </main>
  );
}
