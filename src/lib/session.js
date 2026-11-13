import { cookies } from "next/headers";
import { cache } from "react";
import { COOKIE, verifyToken } from "./auth";
import { connectDB } from "./db";
import User from "./models/User";
import { tierFor } from "./age";

export const getSession = cache(async () => {
  const token = cookies().get(COOKIE)?.value;
  return token ? verifyToken(token) : null;
});

// Returns a plain object or null. Admin has no DB record: it is recognised from env credentials.
export const getCurrentUser = cache(async () => {
  const s = await getSession();
  if (!s) return null;
  if (s.role === "admin") {
    return {
      id: "admin",
      isAdmin: true,
      username: "Admin",
      age: 99,
      country: process.env.ADMIN_COUNTRY || "NG",
      tier: tierFor(99),
      watchlist: [],
      history: [],
    };
  }
  try {
    await connectDB();
    const u = await User.findById(s.sub).lean();
    if (!u || u.status !== "active") return null;
    return {
      id: String(u._id),
      isAdmin: false,
      username: u.username || u.email.split("@")[0],
      email: u.email,
      phone: u.phone || "",
      country: u.country || "",
      age: u.age || null,
      hasUsername: Boolean(u.username),
      profileComplete: Boolean(u.username && u.age && u.country),
      tier: tierFor(u.age),
      watchlist: u.watchlist || [],
      history: u.history || [],
      createdAt: u.createdAt,
    };
  } catch {
    return null;
  }
});

// For route handlers: returns { user } or { error: Response-able object }
export async function requireUser() {
  const user = await getCurrentUser();
  return user ? { user } : { error: { message: "Please sign in", status: 401 } };
}

export async function requireAdmin() {
  const s = await getSession();
  return s?.role === "admin" ? { ok: true } : { error: { message: "Forbidden", status: 403 } };
}

import { redirect } from "next/navigation";
// For server components: send signed-out (or suspended) visitors to the sign-in page.
export async function requirePageUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  return user;
}
