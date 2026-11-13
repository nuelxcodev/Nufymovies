import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { signToken, setAuthCookie, ADMIN_TTL } from "@/lib/auth";
import { safeEqual } from "@/lib/safeEqual";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { ok, fail, readJson } from "@/lib/http";

// Compared against when the user doesn't exist, so response time doesn't reveal which accounts exist.
const DUMMY_HASH = bcrypt.hashSync("nufy-dummy-password", 10);

export async function POST(req) {
  const body = await readJson(req);
  const identifier = String(body.identifier || body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!identifier || !password) return fail("Enter your username or email and password", 400);

  const rl = rateLimit(`signin:${clientIp(req)}`, 10, 15 * 60 * 1000);
  if (!rl.ok) return fail(`Too many attempts. Try again in ${Math.ceil(rl.retryAfter / 60)} min.`, 429);

  try {
    // Admin: recognised from env credentials only — never stored in the database.
    const adminLogin = (process.env.ADMIN_LOGIN || "").trim().toLowerCase();
    const adminPass = process.env.ADMIN_PASSWORD || "";
    if (adminLogin && adminPass && identifier === adminLogin) {
      if (!safeEqual(password, adminPass)) return fail("Invalid credentials", 401);
      const res = ok({ message: "Signed in", redirect: "/admin" });
      setAuthCookie(res, await signToken({ sub: "admin", role: "admin" }, ADMIN_TTL), ADMIN_TTL);
      return res;
    }

    await connectDB();
    const user = await User.findOne(identifier.includes("@") ? { email: identifier } : { usernameLower: identifier });
    const valid = await bcrypt.compare(password, user?.password || DUMMY_HASH);
    if (!user || !valid) return fail("Invalid credentials", 401);
    if (user.status === "suspended") return fail("This account has been suspended. Contact support.", 403);

    user.lastLoginAt = new Date();
    await user.save();
    const res = ok({ message: "Signed in", redirect: "/" });
    setAuthCookie(res, await signToken({ sub: String(user._id), role: "user" }));
    return res;
  } catch (e) {
    console.error("signin", e);
    return fail("Something went wrong, try again", 500);
  }
}
