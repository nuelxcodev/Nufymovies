import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { signToken, setAuthCookie } from "@/lib/auth";
import { validateSignup } from "@/lib/validators";
import { getSettings } from "@/lib/settings";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { ok, fail, readJson } from "@/lib/http";
import { NextResponse } from "next/server";

export async function POST(req) {
  const rl = rateLimit(`signup:${clientIp(req)}`, 8, 60 * 60 * 1000);
  if (!rl.ok) return fail("Too many sign-ups from this network. Try again later.", 429);

  const { errors, values } = validateSignup(await readJson(req));
  if (Object.keys(errors).length) return fail("Please fix the highlighted fields", 400, { errors });

  const adminLogin = (process.env.ADMIN_LOGIN || "").trim().toLowerCase();
  if (adminLogin && (values.username.toLowerCase() === adminLogin || values.email === adminLogin)) {
    return fail("Please fix the highlighted fields", 400, { errors: { username: "That username is reserved" } });
  }

  try {
    const settings = await getSettings();
    if (!settings.signupsOpen) return fail("New sign-ups are paused right now. Please check back soon.", 403);

    await connectDB();
    if (await User.findOne({ email: values.email })) {
      return fail("Please fix the highlighted fields", 409, { errors: { email: "An account with this email already exists" } });
    }
    if (await User.findOne({ usernameLower: values.username.toLowerCase() })) {
      return fail("Please fix the highlighted fields", 409, { errors: { username: "That username is taken" } });
    }

    const user = await User.create({
      username: values.username,
      usernameLower: values.username.toLowerCase(),
      email: values.email,
      password: await bcrypt.hash(values.password, 10),
      phone: values.phone,
      country: values.country,
      age: values.age,
      lastLoginAt: new Date(),
    });
    const res = ok({ message: "Account created", redirect: "/" });
    setAuthCookie(res, await signToken({ sub: String(user._id), role: "user" }));
    return res;
  } catch (e) {
    console.error("signup", e);
    return fail("Something went wrong, try again", 500);
  }
}
