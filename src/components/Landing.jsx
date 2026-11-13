import Link from "next/link";
import { BsPlayCircle, BsDownload, BsShieldCheck } from "react-icons/bs";

const POINTS = [
  { icon: BsPlayCircle, title: "Watch free, in full", text: "Classic and public-domain films stream in full, with no subscription. Everything else gets its trailer." },
  { icon: BsDownload, title: "Download for later", text: "Save films to your phone in a data-saver size, then watch anywhere, even offline." },
  { icon: BsShieldCheck, title: "Matched to your age", text: "Your age sets what you see. Cartoons stay with cartoons. Adult films stay out of the kids' catalogue." },
];

export default function Landing({ posters = [] }) {
  return (
    <main>
      <section className="relative isolate overflow-hidden pb-16 pt-32 md:pt-40">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_0%,rgb(var(--brand)/0.2),transparent_55%)]" />
        <div className="page grid items-center gap-10 md:grid-cols-[1.1fr_1fr]">
          <div>
            <h1 className="font-display text-5xl font-extrabold leading-[1.02] md:text-7xl">Movies you can watch, download and keep.</h1>
            <p className="mt-5 max-w-lg text-lg text-muted">Nufy brings free full-length films, fresh trailers and a catalogue that fits your age, all in one place.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="btn btn-primary px-6 py-3 text-base">Create free account</Link>
              <Link href="/signin" className="btn btn-outline px-6 py-3 text-base">Sign in</Link>
            </div>
          </div>
          {posters.length > 0 && (
            <div className="grid grid-cols-4 gap-3 md:grid-cols-3" aria-hidden="true">
              {posters.slice(0, 9).map((p, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={p} alt="" className={`aspect-[2/3] w-full rounded-lg object-cover ring-1 ring-line ${i % 3 === 1 ? "md:translate-y-6" : ""}`} />
              ))}
            </div>
          )}
        </div>
      </section>
      <section className="page grid gap-4 md:grid-cols-3">
        {POINTS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="panel p-6">
            <Icon size={26} className="text-brand" />
            <h2 className="mt-4 text-lg font-bold">{title}</h2>
            <p className="mt-2 text-sm text-muted">{text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
