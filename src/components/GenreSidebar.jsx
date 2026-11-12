"use client";
import { useState } from "react";
import Link from "next/link";
import { RiMenu3Fill } from "react-icons/ri";
import { BiX } from "react-icons/bi";

export default function GenreSidebar({ genres, activeId }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open genres"
          className="md:hidden shadow-lg absolute z-40 bg-neutral-200 dark:bg-neutral-600 text-black dark:text-white top-[70px] left-5 rounded-full h-12 w-12 flex items-center justify-center"
        >
          <RiMenu3Fill size={20} />
        </button>
      )}
      <ul
        className={`fixed top-6 h-screen z-40 w-full px-10 py-7 md:relative md:w-[20%] md:top-0 overflow-y-auto duration-500 bg-white dark:bg-black ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center w-full justify-between">
          <h2 className="text-3xl font-extrabold my-7">Genres</h2>
          {open && (
            <button onClick={() => setOpen(false)} className="md:hidden" aria-label="Close genres">
              <BiX size={30} />
            </button>
          )}
        </div>
        <li>
          <Link href="/" onClick={() => setOpen(false)}
            className={`block p-2 w-full hover:bg-yellow-500 ${!activeId ? "bg-yellow-500 text-black" : ""}`}>
            All
          </Link>
        </li>
        {genres.map((g) => (
          <li key={g.id}>
            <Link
              href={`/?genre=${g.id}`}
              onClick={() => setOpen(false)}
              className={`block p-2 w-full hover:bg-yellow-500 ${String(g.id) === String(activeId) ? "bg-yellow-500 text-black" : ""}`}
            >
              {g.name}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
