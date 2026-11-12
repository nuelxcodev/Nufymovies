"use client";
import { useState } from "react";
import Link from "next/link";
import { BiMenu, BiMoon } from "react-icons/bi";
import { BsSun, BsX } from "react-icons/bs";
import { useTheme } from "./ThemeProvider";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();

  return (
    <nav className="fixed w-full block md:flex z-50 py-5 justify-around bg-white dark:bg-black md:bg-transparent dark:md:bg-transparent">
      <div className="flex w-full md:w-min justify-between px-8">
        <Link href="/" className="text-2xl font-extrabold text-yellow-600">
          nufy
        </Link>
        <button onClick={() => setOpen((o) => !o)} className="md:hidden" aria-label="Toggle menu">
          {open ? <BsX size={30} /> : <BiMenu size={30} />}
        </button>
      </div>
      <ul
        className={`bg-white dark:bg-black md:bg-transparent dark:md:bg-transparent z-40 flex flex-col md:flex-row md:items-center md:gap-7 md:h-min px-8 md:px-0 transform duration-500 ${
          open ? "translate-x-0 h-screen" : "-translate-x-full md:translate-x-0 h-0 overflow-hidden md:overflow-visible"
        }`}
      >
        <li className="my-5"><Link href="/" onClick={() => setOpen(false)}>Home</Link></li>
        <li className="my-5"><Link href="/signin" onClick={() => setOpen(false)}>Sign in</Link></li>
        <li className="my-5">
          <Link href="/signup" onClick={() => setOpen(false)} className="bg-orange-600 text-white p-2 rounded-xl">
            Sign up
          </Link>
        </li>
        <li className="my-5">
          <button onClick={toggle} aria-label="Toggle theme">
            {theme === "light" ? <BsSun size={20} /> : <BiMoon size={20} />}
          </button>
        </li>
      </ul>
    </nav>
  );
}
