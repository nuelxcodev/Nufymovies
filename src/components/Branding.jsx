"use client";
import { useEffect, useRef, useState } from "react";

const FALLBACK_TITLE = "Welcome to Nufy Movies";
const FALLBACK_TEXT =
  "Discover the latest and greatest in the world of cinema. Browse trending movies, watch trailers, and explore genres, release dates and more.";

export default function Branding({ movies }) {
  const list = movies.filter((m) => m.poster);
  const [active, setActive] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const center = el.getBoundingClientRect().left + el.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      [...el.children].forEach((child, i) => {
        const r = child.getBoundingClientRect();
        const dist = Math.abs(r.left + r.width / 1.5 - center);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
        child.classList.remove("scaled");
      });
      el.children[best]?.classList.add("scaled");
      setActive(best);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    return () => el.removeEventListener("scroll", update);
  }, [list.length]);

  const current = list[active];
  const bg = current?.backdrop || current?.backdrops?.[0];

  return (
    <div className="relative w-full p-9 h-[85vh] max-h-[1200px]">
      <div className="absolute inset-0 h-full w-full z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {bg && <img src={bg} alt="" className="h-full w-full object-cover" />}
      </div>
      <div
        className="bg-gradient-to-tr from-red-800 via-neutral-800/70 to-neutral-800/50 absolute h-full w-full inset-0 z-20"
        style={{ backdropFilter: "blur(5px)" }}
      >
        <div className="w-full h-[70%] md:w-[40%] md:h-full flex justify-center items-center p-7 text-neutral-200/60">
          <div>
            <h1 className="text-4xl md:text-6xl font-extrabold my-3">{current?.original_title || FALLBACK_TITLE}</h1>
            <p className="text-base md:text-xl line-clamp-6">{current?.overview || FALLBACK_TEXT}</p>
          </div>
        </div>
      </div>
      <div className="h-[40%] w-full md:max-w-[60%] md:h-full absolute md:bottom-3 bottom-0 right-0 overflow-hidden z-30">
        <div className="h-full w-full branding_movie_list" ref={ref}>
          {list.map((movie) => (
            <div key={movie.id} className="w-[100px] md:w-[150px] h-auto shadow-lg rounded-md overflow-hidden duration-300">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={movie.poster} alt={movie.title} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
