"use client";

// Tiny fetch helper for admin screens. Always resolves to { success, message, ...data }.
export async function api(url, method = "GET", body) {
  try {
    const r = await fetch(url, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
    return await r.json();
  } catch {
    return { success: false, message: "Network error" };
  }
}
