import Link from "next/link";
import Nav from "@/components/Nav";
import Branding from "@/components/Branding";
import Card from "@/components/Card";
import GenreSidebar from "@/components/GenreSidebar";
import { getGenres, getMovies } from "@/lib/tmdb";

export const revalidate = 3600;

export default async function Home({ searchParams }) {
  const page = Math.max(1, parseInt(searchParams.page, 10) || 1);
  const genre = searchParams.genre;

  let genres = [];
  let data = { movies: [], totalPages: 1 };
  let error = null;
  try {
    [genres, data] = await Promise.all([getGenres(), getMovies({ page, genre })]);
  } catch (e) {
    error = e.message;
  }

  const q = (p) => {
    const params = new URLSearchParams();
    if (genre) params.set("genre", genre);
    params.set("page", p);
    return `/?${params}`;
  };

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center text-center p-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Couldn&apos;t load movies</h1>
          <p className="opacity-70">{error}. Check that TMDB_API_TOKEN is set in .env.local.</p>
        </div>
      </div>
    );
  }

  const btn = "px-4 py-2 bg-yellow-500 text-black w-36 text-center";
  return (
    <div className="h-full w-full">
      <Nav />
      <Branding movies={data.movies} />

      <div className="h-screen overflow-hidden relative w-full">
        <div className="flex w-full h-full relative">
          <GenreSidebar genres={genres} activeId={genre} />
          <div className="w-full md:w-[80%] h-full px-3 z-30">
            <div className="overflow-y-scroll h-full scrollbar-hide pb-28">
              <h1 className="text-5xl font-extrabold my-7 px-8">Movies</h1>
              <div className="movie_card_container">
                {data.movies.map((m) => <Card movie={m} key={m.id} />)}
              </div>
            </div>
            <div className="absolute bottom-0 py-6 w-full left-0 bg-black/40" style={{ backdropFilter: "blur(4px)" }}>
              <div className="flex w-full justify-center gap-[20%]">
                {page > 1 ? <Link href={q(page - 1)} className={btn}>Previous</Link> : <span className={`${btn} opacity-40`}>Previous</span>}
                {page < data.totalPages ? <Link href={q(page + 1)} className={btn}>Next</Link> : <span className={`${btn} opacity-40`}>Next</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
