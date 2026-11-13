"use client";
import { useRef } from "react";
import Link from "next/link";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";

// Horizontal row. Children are server-rendered cards.
export default function Shelf({ title, href, wide = false, children }) {
  const ref = useRef(null);
  const by = (dir) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.85, behavior: "smooth" });
  return (
    <section className="page mt-10" aria-label={title}>
      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-xl font-bold md:text-2xl">{title}</h2>
        <div className="flex items-center gap-2">
          {href && <Link href={href} className="mr-2 text-sm font-medium text-muted hover:text-brand">See all</Link>}
          <button onClick={() => by(-1)} aria-label={`Scroll ${title} left`} className="hidden h-8 w-8 items-center justify-center rounded-full bg-surface2 hover:bg-line md:flex"><BiChevronLeft size={20} /></button>
          <button onClick={() => by(1)} aria-label={`Scroll ${title} right`} className="hidden h-8 w-8 items-center justify-center rounded-full bg-surface2 hover:bg-line md:flex"><BiChevronRight size={20} /></button>
        </div>
      </div>
      <div ref={ref} className="scrollbar-hide -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:-mx-6 md:px-6">
        {Array.isArray(children)
          ? children.map((c, i) => (
              <div key={i} className={`shrink-0 snap-start ${wide ? "w-[240px] md:w-[280px]" : "w-[136px] sm:w-[160px] md:w-[176px]"}`}>{c}</div>
            ))
          : children}
      </div>
    </section>
  );
}
