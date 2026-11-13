import { getCurrentUser } from "@/lib/session";
import { todayISO } from "@/lib/tmdb";
import { ok, fail } from "@/lib/http";

// Lightweight profile for client UI: who am I, what's saved, what's been released.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return fail("Please sign in", 401);
  const today = todayISO();
  const saved = {};
  user.watchlist.forEach((w) => (saved[w.key] = { remind: Boolean(w.remind) }));
  const released = user.watchlist.filter((w) => w.remind && w.releaseDate && w.releaseDate <= today).length;
  return ok({
    user: { username: user.username, isAdmin: user.isAdmin, tier: user.tier.label, canSave: !user.isAdmin, profileComplete: user.isAdmin || user.profileComplete },
    saved,
    releasedCount: released,
  });
}
