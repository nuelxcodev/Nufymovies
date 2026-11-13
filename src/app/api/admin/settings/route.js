import Setting from "@/lib/models/Setting";
import { getSettings, bustSettings } from "@/lib/settings";
import { ok, readJson } from "@/lib/http";
import { guard } from "../guard";

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  bustSettings();
  const { signupsOpen, maintenance, downloadsEnabled, freeLibraryEnabled, announcement } = await getSettings();
  return ok({ settings: { signupsOpen, maintenance, downloadsEnabled, freeLibraryEnabled, announcement } });
}

export async function PUT(req) {
  const denied = await guard();
  if (denied) return denied;
  const b = await readJson(req);
  const update = {
    signupsOpen: Boolean(b.signupsOpen),
    maintenance: Boolean(b.maintenance),
    downloadsEnabled: Boolean(b.downloadsEnabled),
    freeLibraryEnabled: Boolean(b.freeLibraryEnabled),
    announcement: String(b.announcement || "").trim().slice(0, 240),
  };
  await Setting.findOneAndUpdate({ key: "main" }, update, { upsert: true, setDefaultsOnInsert: true });
  bustSettings();
  return ok({ message: "Settings saved" });
}
