import { connectDB } from "./db";
import { Setting } from "./models";

export const DEFAULT_SETTINGS = {
  signupsOpen: true,
  maintenance: false,
  downloadsEnabled: true,
  freeLibraryEnabled: true,
  announcement: "",
};

let cache = { at: 0, value: DEFAULT_SETTINGS };

export async function getSettings() {
  if (Date.now() - cache.at < 15000) return cache.value;
  try {
    await connectDB();
    const doc = await Setting.findOne({ key: "main" }).lean();
    cache = { at: Date.now(), value: { ...DEFAULT_SETTINGS, ...(doc || {}) } };
  } catch {
    cache = { at: Date.now() - 10000, value: cache.value }; // retry soon, keep last known
  }
  return cache.value;
}

export function bustSettings() {
  cache.at = 0;
}
