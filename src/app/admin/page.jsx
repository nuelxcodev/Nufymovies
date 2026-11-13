import { connectDB } from "@/lib/db";
import { User, Review, Report, Event, MovieOverride } from "@/lib/models";
import { countryName } from "@/lib/countries";

export const dynamic = "force-dynamic";

const AGE_LABELS = { 0: "Under 7", 7: "7–12", 13: "13–15", 16: "16–17", 18: "18+" };

function Bars({ rows, empty = "No data yet" }) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  if (!rows.length) return <p className="text-sm text-muted">{empty}</p>;
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.label} className="text-sm">
          <div className="mb-1 flex justify-between gap-3"><span className="truncate">{r.label}</span><span className="text-muted">{r.n}</span></div>
          <div className="h-1.5 rounded-full bg-surface2"><div className="h-full rounded-full bg-brand" style={{ width: `${(r.n / max) * 100}%` }} /></div>
        </li>
      ))}
    </ul>
  );
}

const Stat = ({ label, value, tone }) => (
  <div className="panel p-4">
    <p className="text-sm text-muted">{label}</p>
    <p className={`mt-1 font-display text-3xl font-extrabold ${tone || ""}`}>{value}</p>
  </div>
);

export default async function Overview() {
  let d;
  try {
    await connectDB();
    const week = new Date(Date.now() - 7 * 864e5);
    const month = new Date(Date.now() - 30 * 864e5);
    const topBy = (type) => Event.aggregate([{ $match: { type, createdAt: { $gte: month } } }, { $group: { _id: "$key", title: { $first: "$title" }, n: { $sum: 1 } } }, { $sort: { n: -1 } }, { $limit: 6 }]);
    const [users, newWeek, suspended, reviews, openReports, rules, countries, ages, plays, downloads, recent] = await Promise.all([
      User.countDocuments(), User.countDocuments({ createdAt: { $gte: week } }), User.countDocuments({ status: "suspended" }),
      Review.countDocuments(), Report.countDocuments({ status: "open" }), MovieOverride.countDocuments(),
      User.aggregate([{ $match: { country: { $exists: true, $ne: null } } }, { $group: { _id: "$country", n: { $sum: 1 } } }, { $sort: { n: -1 } }, { $limit: 6 }]),
      User.aggregate([{ $match: { age: { $exists: true } } }, { $bucket: { groupBy: "$age", boundaries: [0, 7, 13, 16, 18, 200], default: "other", output: { n: { $sum: 1 } } } }]),
      topBy("play"), topBy("download"),
      User.find().sort({ createdAt: -1 }).limit(5).select("username email country createdAt").lean(),
    ]);
    d = { users, newWeek, suspended, reviews, openReports, rules, countries, ages, plays, downloads, recent };
  } catch (e) {
    return <div className="panel p-6"><h1 className="text-xl font-bold">Database unavailable</h1><p className="mt-2 text-sm text-muted">Check MONGO_URI. {e.message}</p></div>;
  }

  const checks = [
    ["Database", Boolean(process.env.MONGO_URI)],
    ["TMDB key", Boolean(process.env.TMDB_API_TOKEN || process.env.API_BEARIER || process.env.TMDB_API_KEY)],
    ["JWT secret", (process.env.JWT_SECRET || "").length >= 32],
    ["Admin credentials", Boolean(process.env.ADMIN_LOGIN && process.env.ADMIN_PASSWORD)],
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">Overview</h1>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Members" value={d.users} />
        <Stat label="New this week" value={d.newWeek} />
        <Stat label="Open reports" value={d.openReports} tone={d.openReports ? "text-danger" : ""} />
        <Stat label="Suspended" value={d.suspended} />
        <Stat label="Reviews" value={d.reviews} />
        <Stat label="Movie rules" value={d.rules} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="panel p-5"><h2 className="mb-3 font-bold">Members by age group</h2>
          <Bars rows={d.ages.map((a) => ({ label: AGE_LABELS[a._id] || "Other", n: a.n }))} />
        </section>
        <section className="panel p-5"><h2 className="mb-3 font-bold">Top countries</h2>
          <Bars rows={d.countries.map((c) => ({ label: countryName(c._id), n: c.n }))} />
        </section>
        <section className="panel p-5"><h2 className="mb-3 font-bold">System checks</h2>
          <ul className="space-y-2 text-sm">
            {checks.map(([l, good]) => <li key={l} className="flex justify-between"><span>{l}</span><span className={good ? "text-good" : "text-danger"}>{good ? "OK" : "Missing"}</span></li>)}
          </ul>
        </section>
        <section className="panel p-5"><h2 className="mb-3 font-bold">Most played (30 days)</h2>
          <Bars rows={d.plays.map((p) => ({ label: p.title || p._id, n: p.n }))} />
        </section>
        <section className="panel p-5"><h2 className="mb-3 font-bold">Most downloaded (30 days)</h2>
          <Bars rows={d.downloads.map((p) => ({ label: p.title || p._id, n: p.n }))} />
        </section>
        <section className="panel p-5"><h2 className="mb-3 font-bold">Latest sign-ups</h2>
          <ul className="space-y-2 text-sm">
            {d.recent.map((u) => <li key={String(u._id)} className="flex justify-between gap-3"><span className="truncate">{u.username || u.email}</span><span className="text-muted">{countryName(u.country)}</span></li>)}
          </ul>
        </section>
      </div>
    </div>
  );
}
