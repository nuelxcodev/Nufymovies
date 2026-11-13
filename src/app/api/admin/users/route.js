import { User } from "@/lib/models";
import { ok, clampInt } from "@/lib/http";
import { guard } from "@/lib/session";

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function GET(req) {
  const denied = await guard();
  if (denied) return denied;
  const sp = req.nextUrl.searchParams;
  const q = (sp.get("q") || "").trim().slice(0, 60);
  const page = clampInt(sp.get("page"), 1, 10000, 1);
  const per = 20;
  const filter = q ? { $or: ["username", "email", "phone"].map((f) => ({ [f]: { $regex: esc(q), $options: "i" } })) } : {};
  if (sp.get("status") === "suspended") filter.status = "suspended";
  const [total, rows] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter).select("-password -watchlist -history").sort({ createdAt: -1 }).skip((page - 1) * per).limit(per).lean(),
  ]);
  return ok({
    total,
    pages: Math.max(1, Math.ceil(total / per)),
    users: rows.map((u) => ({
      id: String(u._id), username: u.username || "", email: u.email, phone: u.phone || "", country: u.country || "",
      age: u.age || null, status: u.status, createdAt: u.createdAt, lastLoginAt: u.lastLoginAt || null,
    })),
  });
}
