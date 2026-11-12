import { NextResponse } from "next/server";
import { getMovies, getGenres } from "@/lib/tmdb";

// Replaces POST /api/v1/movies (also supports GET ?page=&genre=)
async function handle(page, genre) {
  try {
    const [genres, data] = await Promise.all([getGenres(), getMovies({ page, genre })]);
    return NextResponse.json({ movies: data.movies, genre: { genres }, totalPages: data.totalPages });
  } catch (e) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}

export async function GET(req) {
  const sp = req.nextUrl.searchParams;
  return handle(Number(sp.get("page")) || 1, sp.get("genre"));
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  return handle(Number(body.page) || 1, body.genre);
}
