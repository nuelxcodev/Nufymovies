"use client";
import { useState } from "react";
import Link from "next/link";
import { RiMenu3Fill } from "react-icons/ri";
import { BiX } from "react-icons/bi";

export default function GenreSidebar({ genres, activeId, basePath = "/browse", sort }) {
  const [open, setOpen] = useState(false);
  const href = (id) => {
    const p = new URLSearchParams();
    if (id) p.set("genre", id);
    if (sort) p.set("sort", sort);
    const s = p.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  const row = (on) => `block rounded-md px-3 py-2 text-sm font-medium ${on ? "bg-brand text-brand-ink" : "text-muted hover:bg-surface2 hover:text-ink"}`;
  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="Open genres" className="btn btn-ghost mb-4 md:hidden">
        <RiMenu3Fill size={16} /> Genres
      </button>
      <aside className={`${open ? "fixed inset-0 z-[60] overflow-y-auto bg-bg p-6" : "hidden"} md:static md:block md:w-52 md:shrink-0 md:p-0`}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Genres</h2>
          <button onClick={() => setOpen(false)} className="md:hidden" aria-label="Close genres"><BiX size={28} /></button>
        </div>
        <ul className="space-y-1 md:sticky md:top-24">
          <li><Link href={href()} onClick={() => setOpen(false)} className={row(!activeId)}>All</Link></li>
          {genres.map((g) => (
            <li key={g.id}>
              <Link href={href(g.id)} onClick={() => setOpen(false)} className={row(String(g.id) === String(activeId))}>{g.name}</Link>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
}
