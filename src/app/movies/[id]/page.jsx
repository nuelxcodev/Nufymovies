import Link from "next/link";
import { notFound } from "next/navigation";
import { BiArrowBack } from "react-icons/bi";
import Nav from "@/components/Nav";
import VideoPlayer from "@/components/VideoPlayer";
import { getMovieDetail } from "@/lib/tmdb";

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  try {
    const m = await getMovieDetail(params.id);
    return { title: `${m.title} · MyMovieBox`, description: m.overview };
  } catch {
    return { title: "MyMovieBox" };
  }
}

export default async function MoviePage({ params }) {
  let movie;
  try {
    movie = await getMovieDetail(params.id);
  } catch {
    notFound();
  }
  const trailer = movie.trailers[0];

  return (
    <div className="relative">
      <Nav />
      <Link href="/" aria-label="Back"
        className="fixed bg-neutral-600 rounded-full bottom-11 z-30 left-9 md:hidden text-white shadow-lg">
        <BiArrowBack size={40} />
      </Link>

      <div className="w-full flex flex-col md:flex-row pt-20 md:pt-24">
        <VideoPlayer videoId={trailer?.key} />
        <div className="md:w-1/2 md:p-8 p-4">
          <h1 className="text-3xl font-extrabold">{movie.title}</h1>
          <p className="opacity-70 my-2">
            {[movie.year, movie.runtime && `${movie.runtime} min`, movie.genres.map((g) => g.name).join(", ")]
              .filter(Boolean).join(" · ")}
          </p>
          <p>{movie.overview}</p>
          {movie.cast.length > 0 && <p className="mt-4 opacity-70"><b>Cast:</b> {movie.cast.join(", ")}</p>}
          {movie.companies.length > 0 && (
            <div className="flex flex-wrap gap-4 my-7 bg-white p-4 rounded-md">
              {movie.companies.map((c) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={c.id} src={c.logo} alt={c.name} className="h-8 w-auto object-contain" />
              ))}
            </div>
          )}
        </div>
      </div>

      {movie.backdrops.length > 0 && (
        <div className="flex overflow-x-auto scrollbar-hide mt-8 gap-2">
          {movie.backdrops.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="" loading="lazy" className="h-[200px] flex-shrink-0" />
          ))}
        </div>
      )}
    </div>
  );
}
