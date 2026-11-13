import { connectDB } from "./db";
import MovieOverride from "./models/MovieOverride";

let cache = { at: 0, map: new Map() };

// Map<tmdbId, override>. Tiny collection, cached for 20s; busted on admin writes.
export async function getOverrides() {
  if (Date.now() - cache.at < 20000) return cache.map;
  try {
    await connectDB();
    const docs = await MovieOverride.find({}).lean();
    cache = { at: Date.now(), map: new Map(docs.map((d) => [d.tmdbId, d])) };
  } catch {
    cache = { at: Date.now() - 15000, map: cache.map };
  }
  return cache.map;
}

export const bustOverrides = () => {
  cache.at = 0;
};
