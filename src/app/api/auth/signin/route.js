import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { signToken, setAuthCookie } from "@/lib/auth";

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  try {
    await connectDB();
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 });
    }
    const res = NextResponse.json({ success: true, message: "Signed in" });
    setAuthCookie(res, signToken({ id: user._id.toString(), email }));
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: "Something went wrong, try again" }, { status: 500 });
  }
}
