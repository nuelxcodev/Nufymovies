import { searchArchive } from "@/lib/archive";
import { ok } from "@/lib/http";
import { guard } from "../guard";

export async function GET(req) {
  const denied = await guard();
  if (denied) return denied;
  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  return ok({ items: await searchArchive(q, 8) });
}
