import Card from "@/components/Card";
import ClearHistory from "@/components/ClearHistory";
import { requirePageUser } from "@/lib/session";
import { applyOverrides, isFinished } from "@/lib/catalog";
import { todayISO } from "@/lib/tmdb";

export const metadata = { title: "My list" };

export default async function MyList() {
  const user = await requirePageUser();
  if (user.isAdmin) {
    return <main className="page pt-28"><h1 className="text-3xl font-extrabold">My list</h1><p className="mt-2 text-muted">Admin accounts don&apos;t keep a watch list. Sign in as a member to use it.</p></main>;
  }
  const today = todayISO();
  const toMovie = (w) => ({
    key: w.key, id: /^\d+$/.test(w.key) ? Number(w.key) : null, href: w.href, title: w.title, poster: w.poster, backdrop: w.backdrop,
    year: w.year, genreIds: w.genreIds, release_date: w.releaseDate, released: !w.releaseDate || w.releaseDate <= today,
    position: w.position, duration: w.duration,
  });
  const all = await applyOverrides(user.watchlist.map(toMovie), user);
  const raw = Object.fromEntries(user.watchlist.map((w) => [w.key, w]));
  const nowOut = all.filter((m) => raw[m.key].remind && m.release_date && m.release_date <= today);
  const upcoming = all.filter((m) => raw[m.key].remind && m.release_date > today);
  const saved = all.filter((m) => !raw[m.key].remind);
  const watching = (await applyOverrides(user.history.filter((h) => !isFinished(h)).map(toMovie), user));

  const Section = ({ title, hint, children, action }) => (
    <section className="mt-10">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div><h2 className="text-xl font-bold md:text-2xl">{title}</h2>{hint && <p className="text-sm text-muted">{hint}</p>}</div>
        {action}
      </div>
      {children}
    </section>
  );

  const empty = !watching.length && !all.length;
  return (
    <main className="page pt-24">
      <h1 className="text-4xl font-extrabold md:text-5xl">My list</h1>
      {empty && <p className="mt-4 max-w-md text-muted">Nothing saved yet. Tap the bookmark on any poster to keep it here, or the bell on an upcoming film to be reminded.</p>}

      {nowOut.length > 0 && (
        <Section title="Out now" hint="Films you asked to be reminded about have been released.">
          <div className="poster-grid">{nowOut.map((m) => <Card key={m.key} movie={m} />)}</div>
        </Section>
      )}
      {watching.length > 0 && (
        <Section title="Continue watching" action={<ClearHistory />}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{watching.map((m) => <Card key={m.key} movie={m} landscape />)}</div>
        </Section>
      )}
      {saved.length > 0 && <Section title="Saved"><div className="poster-grid">{saved.map((m) => <Card key={m.key} movie={m} />)}</div></Section>}
      {upcoming.length > 0 && (
        <Section title="Reminders" hint="We'll flag these here when they're released.">
          <div className="poster-grid">{upcoming.map((m) => <Card key={m.key} movie={m} />)}</div>
        </Section>
      )}
    </main>
  );
}
