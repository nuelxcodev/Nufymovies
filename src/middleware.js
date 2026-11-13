import { NextResponse } from "next/server";
import { COOKIE, verifyToken } from "@/lib/auth";

const PUBLIC_PAGES = ["/", "/signin", "/signup"];
const isPublic = (p) => PUBLIC_PAGES.includes(p) || p.startsWith("/api/auth/");

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const headers = new Headers(req.headers);
  headers.set("x-pathname", pathname);
  const next = () => NextResponse.next({ request: { headers } });

  const token = req.cookies.get(COOKIE)?.value;
  const session = token ? await verifyToken(token) : null;
  const isApi = pathname.startsWith("/api/");

  // Admin area: anyone who isn't the admin sees a plain 404 (it doesn't reveal the area exists).
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (session?.role === "admin") return next();
    return isApi
      ? NextResponse.json({ success: false, message: "Not found" }, { status: 404 })
      : NextResponse.rewrite(new URL("/not-found-admin", req.url));
  }

  if (isPublic(pathname) || session) return next();

  if (isApi) return NextResponse.json({ success: false, message: "Please sign in" }, { status: 401 });
  const url = req.nextUrl.clone();
  url.pathname = "/signin";
  url.search = `?next=${encodeURIComponent(pathname + req.nextUrl.search)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico|txt)$).*)"],
};
