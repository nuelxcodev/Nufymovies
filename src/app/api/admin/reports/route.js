import { Report } from "@/lib/models";
import { ok } from "@/lib/http";
import { guard } from "@/lib/session";

export async function GET(req) {
  const denied = await guard();
  if (denied) return denied;
  const status = req.nextUrl.searchParams.get("status") === "resolved" ? "resolved" : "open";
  const rows = await Report.find({ status }).sort({ createdAt: -1 }).limit(100).lean();
  return ok({ reports: rows.map((r) => ({ ...r, id: String(r._id), _id: undefined, userId: undefined })) });
}
