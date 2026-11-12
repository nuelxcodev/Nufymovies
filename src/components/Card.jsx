"use client";
import { useState } from "react";
import Link from "next/link";

export default function Card({ movie }) {
  const [hover, setHover] = useState(false);
  if (!movie.poster) return null;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="rounded-md overflow-hidden h-max shadow-lg card_text_anima"
    >
      <div className="relative h-full w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={movie.poster} alt={movie.title} loading="lazy" className="object-cover w-full" />
        {hover && (
          <div className="bg-black/55 absolute inset-0 duration-300">
            <div className="flex justify-center items-center text-white h-full w-full card_text_anima">
              <div className="text-center px-2">
                <h2 className="text-2xl font-extrabold mb-3">{movie.original_title}</h2>
                <p className="mb-2">{movie.year}</p>
                <Link href={`/movies/${movie.id}`} className="bg-red-600 px-3 rounded-md py-2 inline-block">
                  Watch now
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
