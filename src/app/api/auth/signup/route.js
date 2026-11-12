import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { signToken, setAuthCookie } from "@/lib/auth";

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const credentials = body.credentials || body;
  const email = (credentials.email || "").trim().toLowerCase();
  const password = (credentials.password || "").trim();

  if (!email || !password || password.length < 6) {
    return NextResponse.json(
      { success: false, message: "Enter a valid email and a password of 6+ characters" },
      { status: 400 }
    );
  }
  try {
    await connectDB();
    if (await User.findOne({ email })) {
      return NextResponse.json({ success: false, message: "User already exists" }, { status: 409 });
    }
    const user = await User.create({ email, password: await bcrypt.hash(password, 10) });
    const res = NextResponse.json({ success: true, message: "Account created" });
    setAuthCookie(res, signToken({ id: user._id.toString(), email }));
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: "Something went wrong, try again" }, { status: 500 });
  }
}
