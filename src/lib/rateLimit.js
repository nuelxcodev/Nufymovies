// Small in-memory limiter. Good enough for an MVP on one instance; swap for
// Upstash/Redis (free tier) if you scale to many serverless instances.
const hits = globalThis._nufyRL || (globalThis._nufyRL = new Map());

export function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
  const e = hits.get(key);
  if (!e || e.reset < now) {
    hits.set(key, { count: 1, reset: now + windowMs });
    return { ok: true };
  }
  e.count += 1;
  return e.count > limit ? { ok: false, retryAfter: Math.ceil((e.reset - now) / 1000) } : { ok: true };
}

export const clientIp = (req) =>
  req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
