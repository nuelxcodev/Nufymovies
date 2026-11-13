// Edge-safe (used by middleware too): no Node-only imports here.
import { SignJWT, jwtVerify } from "jose";

export const COOKIE = "nufy_token";
export const USER_TTL = 60 * 60 * 24 * 7; // 7 days
export const ADMIN_TTL = 60 * 60 * 12; // 12 hours

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) throw new Error("JWT_SECRET must be set (16+ characters)");
  return new TextEncoder().encode(s);
}

export async function signToken(payload, ttlSeconds = USER_TTL) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(secret());
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload;
  } catch {
    return null;
  }
}

export function setAuthCookie(res, token, maxAge = USER_TTL) {
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
}
