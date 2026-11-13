import MovieOverride from "@/lib/models/MovieOverride";
import { bustOverrides } from "@/lib/overrides";
import { ok } from "@/lib/http";
import { guard } from "../../guard";

export async function DELETE(_req, { params }) {
  const denied = await guard();
  if (denied) return denied;
  await MovieOverride.deleteOne({ tmdbId: Number(params.id) });
  bustOverrides();
  return ok({ message: "Rules removed" });
}
