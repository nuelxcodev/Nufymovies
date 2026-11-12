import { NextResponse } from "next/server";
import { getMovieDetail } from "@/lib/tmdb";

// Replaces POST /api/v1/watchtriller
export async function POST(req) {
  const { movie_id } = await req.json().catch(() => ({}));
  if (!movie_id) return NextResponse.json({ success: false, message: "movie_id required" }, { status: 400 });
  try {
    const movie = await getMovieDetail(movie_id);
    return NextResponse.json({ trailer: movie.trailers });
  } catch (e) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}
