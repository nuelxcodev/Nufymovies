"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BsPlayFill } from "react-icons/bs";
import ListButton from "./ListButton";

// Hero: big backdrop + poster rail. The poster in the centre of the rail is the selected film.
export default function Branding({ movies, genreNames = {} }) {
  const list = movies.filter((m) => m.backdrop || m.poster);
  const [active, setActive] = useState(0);
  const rail = useRef(null);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    let raf;
    const update = () => {
      const center = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      [...el.children].forEach((c, i) => {
        const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - center);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      setActive(best);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [list.length]);

  if (!list.length) return null;
  const cur = list[Math.min(active, list.length - 1)];
  const upcoming = cur.released === false;
  const meta = [cur.year, cur.rating ? `★ ${cur.rating}` : null, ...(cur.genreIds || []).slice(0, 2).map((g) => genreNames[g])].filter(Boolean);
  const item = { key: cur.key, href: cur.href, title: cur.title, poster: cur.poster, year: cur.year, genreIds: cur.genreIds, releaseDate: cur.release_date };

  return (
    <section className="relative isolate h-[88vh] max-h-[920px] min-h-[620px] w-full overflow-hidden text-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img key={cur.id} src={cur.backdrop || cur.poster} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-bg to-transparent" />

      <div className="mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-64 pt-28 md:justify-center md:px-6 md:pb-10">
        <div className="max-w-xl">
          <p className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-white/80">
            {upcoming && <span className="chip bg-brand text-brand-ink">Coming soon</span>}
            {meta.map((m, i) => <span key={i}>{m}</span>)}
          </p>
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] md:text-6xl">{cur.title}</h1>
          <p className="mt-4 line-clamp-3 max-w-lg text-base text-white/80 md:text-lg">{cur.overview}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={cur.href} className="btn btn-primary px-6 py-3 text-base">
              <BsPlayFill size={22} /> {upcoming ? "Watch trailer" : "Watch now"}
            </Link>
            <ListButton item={item} remind={upcoming} variant="overlay" className="py-3" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 right-0 w-full md:bottom-10 md:w-[56%]">
        <div ref={rail} className="hero-rail scrollbar-hide relative" role="listbox" aria-label="Featured films">
          {list.map((m, i) => (
            <button
              key={m.id}
              role="option"
              aria-selected={i === active}
              aria-label={m.title}
              onClick={() => rail.current?.children[i]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })}
              className={`aspect-[2/3] w-[96px] overflow-hidden rounded-md shadow-2xl transition duration-300 md:w-[132px] ${i === active ? "scale-110 ring-2 ring-brand" : "opacity-60 hover:opacity-90"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.poster || m.backdrop} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
