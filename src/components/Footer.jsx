import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-line">
      <div className="page flex flex-col gap-4 py-8 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <p className="font-display text-lg font-bold text-brand">nufy</p>
        <p className="max-w-xl">
          Full-length films come from the Internet Archive&apos;s public-domain collections. Metadata and trailers by{" "}
          <a className="underline" href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer">TMDB</a>; streaming availability by JustWatch.
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
        <Link href="/free" className="font-medium text-ink underline">Free library</Link>
      </div>
    </footer>
  );
}
