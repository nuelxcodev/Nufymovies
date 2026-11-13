import MovieOverride from "@/lib/models/MovieOverride";
import { bustOverrides } from "@/lib/overrides";
import { isArchiveId } from "@/lib/archive";
import { ok, fail, readJson } from "@/lib/http";
import { guard } from "../guard";

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  const rows = await MovieOverride.find({}).sort({ updatedAt: -1 }).limit(300).lean();
  return ok({ overrides: rows.map((r) => ({ ...r, _id: String(r._id) })) });
}

// Create or update the admin rules for one movie.
export async function PUT(req) {
  const denied = await guard();
  if (denied) return denied;
  const b = await readJson(req);
  const tmdbId = Number(b.tmdbId);
  if (!Number.isInteger(tmdbId) || tmdbId <= 0) return fail("Invalid movie id", 400);
  const archiveId = String(b.archiveId || "").trim();
  if (archiveId && !isArchiveId(archiveId)) return fail("That doesn't look like an Internet Archive identifier", 400);
  const minAge = Math.min(21, Math.max(0, parseInt(b.minAge, 10) || 0));
  const doc = {
    tmdbId,
    title: String(b.title || "").slice(0, 200),
    poster: String(b.poster || "").slice(0, 300),
    hidden: Boolean(b.hidden),
    featured: Boolean(b.featured),
    minAge,
    archiveId,
    note: String(b.note || "").slice(0, 300),
  };
  // No rules left → remove the document instead of keeping an empty override.
  if (!doc.hidden && !doc.featured && !doc.minAge && !doc.archiveId && !doc.note) {
    await MovieOverride.deleteOne({ tmdbId });
    bustOverrides();
    return ok({ message: "Rules cleared" });
  }
  await MovieOverride.findOneAndUpdate({ tmdbId }, doc, { upsert: true, new: true, setDefaultsOnInsert: true });
  bustOverrides();
  return ok({ message: "Saved" });
}
