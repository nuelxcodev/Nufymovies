import { MovieOverride } from "@/lib/models";
import { bustOverrides } from "@/lib/overrides";
import { ok } from "@/lib/http";
import { guard } from "@/lib/session";

export async function DELETE(_req, { params }) {
  const denied = await guard();
  if (denied) return denied;
  await MovieOverride.deleteOne({ tmdbId: Number(params.id) });
  bustOverrides();
  return ok({ message: "Rules removed" });
}
