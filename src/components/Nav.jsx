"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BiMenu, BiMoon, BiSearch } from "react-icons/bi";
import { BsSun, BsX } from "react-icons/bs";
import { useTheme } from "./ThemeProvider";
import { useProfile } from "./ProfileProvider";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/free", label: "Free library" },
  { href: "/coming-soon", label: "Coming soon" },
  { href: "/my-list", label: "My list" },
];

export default function Nav({ user }) {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const [q, setQ] = useState("");
  const { theme, toggle } = useTheme();
  const { releasedCount } = useProfile();
  const path = usePathname();
  const router = useRouter();

  useEffect(() => {
    const on = () => setSolid(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setOpen(false), [path]);

  if (path.startsWith("/admin") || path === "/signin" || path === "/signup") return null;

  const go = (e) => {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };
  const signOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/signin");
    router.refresh();
  };
  const active = (h) => (h === "/" ? path === "/" : path.startsWith(h));
  const bg = solid || open ? "bg-bg/95 backdrop-blur border-b border-line" : "bg-gradient-to-b from-black/60 to-transparent";

  return (
    <nav className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${bg}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 md:px-6">
        <Link href="/" className="font-display text-2xl font-extrabold tracking-tight text-brand">
          nufy
        </Link>

        {user && (
          <ul className="hidden items-center gap-5 md:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={`relative text-sm font-medium ${active(l.href) ? "text-ink" : "text-muted hover:text-ink"} ${!solid && path === "/" ? "text-white/80 hover:text-white" : ""}`}>
                  {l.label}
                  {l.href === "/my-list" && releasedCount > 0 && (
                    <span className="absolute -right-3 -top-2 rounded-full bg-brand px-1.5 text-[10px] font-bold text-brand-ink">{releasedCount}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="ml-auto flex items-center gap-3">
          {user && (
            <form onSubmit={go} className="hidden items-center md:flex">
              <label htmlFor="nav-search" className="sr-only">Search movies</label>
              <div className="relative">
                <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input id="nav-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search titles" className="input w-52 pl-9" />
              </div>
            </form>
          )}
          <button onClick={toggle} aria-label="Toggle theme" className="rounded-full p-2 text-ink hover:bg-surface2">
            {theme === "light" ? <BsSun size={18} /> : <BiMoon size={18} />}
          </button>
          {user ? (
            <div className="relative hidden md:block">
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full bg-surface2 py-1 pl-1 pr-3 text-sm font-medium">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-xs font-bold text-brand-ink">{user.username?.[0]?.toUpperCase()}</span>
                  {user.username}
                </summary>
                <div className="panel absolute right-0 mt-2 w-48 overflow-hidden p-1 text-sm shadow-xl">
                  {user.isAdmin ? (
                    <Link href="/admin" className="block rounded-md px-3 py-2 hover:bg-surface2">Admin dashboard</Link>
                  ) : (
                    <Link href="/account" className="block rounded-md px-3 py-2 hover:bg-surface2">Account</Link>
                  )}
                  <button onClick={signOut} className="block w-full rounded-md px-3 py-2 text-left hover:bg-surface2">Sign out</button>
                </div>
              </details>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link href="/signin" className="btn btn-ghost">Sign in</Link>
              <Link href="/signup" className="btn btn-primary">Sign up</Link>
            </div>
          )}
          <button onClick={() => setOpen((o) => !o)} className="rounded-full p-2 md:hidden" aria-label="Toggle menu" aria-expanded={open}>
            {open ? <BsX size={26} /> : <BiMenu size={26} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-bg px-4 pb-6 pt-3 md:hidden">
          {user && (
            <form onSubmit={go} className="mb-3">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search titles" className="input" aria-label="Search movies" />
            </form>
          )}
          <ul className="space-y-1">
            {(user ? LINKS : [{ href: "/", label: "Home" }]).map((l) => (
              <li key={l.href}><Link href={l.href} className="block rounded-md px-2 py-2.5 font-medium hover:bg-surface2">{l.label}</Link></li>
            ))}
            {user ? (
              <>
                <li><Link href={user.isAdmin ? "/admin" : "/account"} className="block rounded-md px-2 py-2.5 font-medium hover:bg-surface2">{user.isAdmin ? "Admin dashboard" : "Account"}</Link></li>
                <li><button onClick={signOut} className="block w-full rounded-md px-2 py-2.5 text-left font-medium hover:bg-surface2">Sign out</button></li>
              </>
            ) : (
              <li className="flex gap-2 pt-2">
                <Link href="/signin" className="btn btn-ghost flex-1">Sign in</Link>
                <Link href="/signup" className="btn btn-primary flex-1">Sign up</Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
}
