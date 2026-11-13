"use client";
import { useEffect, useState } from "react";
import { api } from "./useAdminApi";

const TOGGLES = [
  ["signupsOpen", "Allow new sign-ups", "Turn off to pause registrations."],
  ["freeLibraryEnabled", "Free library and full-film playback", "Off = trailers only everywhere."],
  ["downloadsEnabled", "Allow downloads", "Hides the Download button on free films."],
  ["maintenance", "Maintenance mode", "Members see a maintenance page. You can still sign in."],
];

export default function SettingsAdmin() {
  const [s, setS] = useState(null);
  const [note, setNote] = useState("");
  useEffect(() => { api("/api/admin/settings").then((r) => r.success && setS(r.settings)); }, []);
  if (!s) return <p className="text-muted">Loading…</p>;

  const save = async (e) => {
    e.preventDefault();
    const r = await api("/api/admin/settings", "PUT", s);
    setNote(r.message);
  };
  return (
    <form onSubmit={save} className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-extrabold">Settings</h1>
      <div className="panel divide-y divide-line">
        {TOGGLES.map(([k, l, h]) => (
          <label key={k} className="flex cursor-pointer items-center justify-between gap-4 p-4">
            <span><span className="block font-semibold">{l}</span><span className="text-sm text-muted">{h}</span></span>
            <input type="checkbox" className="h-5 w-5 accent-[rgb(var(--brand))]" checked={s[k]} onChange={(e) => setS({ ...s, [k]: e.target.checked })} />
          </label>
        ))}
      </div>
      <label className="block text-sm">
        <span className="mb-1 block font-semibold">Site announcement</span>
        <input className="input" maxLength={240} value={s.announcement} onChange={(e) => setS({ ...s, announcement: e.target.value })} placeholder="Shown as a banner on every page. Leave empty to hide." />
      </label>
      {note && <p role="status" className="text-sm text-good">{note}</p>}
      <button className="btn btn-primary">Save settings</button>
    </form>
  );
}
