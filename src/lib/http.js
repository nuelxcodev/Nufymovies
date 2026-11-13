import { NextResponse } from "next/server";

export const ok = (data = {}, status = 200) => NextResponse.json({ success: true, ...data }, { status });
export const fail = (message, status = 400, extra = {}) =>
  NextResponse.json({ success: false, message, ...extra }, { status });
export const readJson = (req) => req.json().catch(() => ({}));
export const clampInt = (v, min, max, fallback) => {
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};
