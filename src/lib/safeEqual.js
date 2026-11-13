import { createHash, timingSafeEqual } from "crypto";

// Constant-time string comparison (hashes first so lengths always match).
export function safeEqual(a, b) {
  const ha = createHash("sha256").update(String(a)).digest();
  const hb = createHash("sha256").update(String(b)).digest();
  return timingSafeEqual(ha, hb);
}
