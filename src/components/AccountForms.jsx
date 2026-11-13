"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { COUNTRIES } from "@/lib/countries";

const send = async (url, method, body) => {
  const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
  return r ? r.json().catch(() => ({ success: false, message: "Unexpected response" })) : { success: false, message: "Network error, try again" };
};

function Msg({ r }) {
  if (!r?.message) return null;
  return <p role="status" className={`text-sm ${r.success ? "text-good" : "text-danger"}`}>{r.message}</p>;
}

export default function AccountForms({ profile }) {
  const router = useRouter();
  const [p, setP] = useState({ username: profile.username || "", phone: profile.phone, country: profile.country || "NG", age: "" });
  const [pr, setPr] = useState(null);
  const [pw, setPw] = useState({ current: "", next: "" });
  const [pwr, setPwr] = useState(null);
  const err = pr?.errors || {};

  async function saveProfile(e) {
    e.preventDefault();
    const body = { phone: p.phone, country: p.country };
    if (!profile.hasUsername) body.username = p.username;
    if (!profile.hasAge) body.age = Number(p.age);
    const r = await send("/api/me/profile", "PATCH", body);
    setPr(r);
    if (r.success) router.refresh();
  }
  async function savePw(e) {
    e.preventDefault();
    const r = await send("/api/me/password", "POST", pw);
    setPwr(r);
    if (r.success) setPw({ current: "", next: "" });
  }
  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/signin");
    router.refresh();
  }

  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2">
      <form onSubmit={saveProfile} className="panel space-y-4 p-5">
        <h2 className="text-lg font-bold">Profile</h2>
        <label className="block text-sm"><span className="mb-1 block text-muted">Username</span>
          <input className="input" value={p.username} disabled={profile.hasUsername} onChange={(e) => setP({ ...p, username: e.target.value })} />
          {err.username && <span className="mt-1 block text-xs text-danger">{err.username}</span>}
        </label>
        <label className="block text-sm"><span className="mb-1 block text-muted">Email</span><input className="input" value={profile.email} disabled /></label>
        <label className="block text-sm"><span className="mb-1 block text-muted">Phone</span>
          <input className="input" type="tel" value={p.phone} onChange={(e) => setP({ ...p, phone: e.target.value })} />
          {err.phone && <span className="mt-1 block text-xs text-danger">{err.phone}</span>}
        </label>
        <label className="block text-sm"><span className="mb-1 block text-muted">Country</span>
          <select className="input" value={p.country} onChange={(e) => setP({ ...p, country: e.target.value })}>
            {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
        </label>
        <label className="block text-sm"><span className="mb-1 block text-muted">Age</span>
          {profile.hasAge ? <input className="input" value={profile.age} disabled /> : <input className="input" type="number" min={5} max={120} value={p.age} onChange={(e) => setP({ ...p, age: e.target.value })} />}
          <span className="mt-1 block text-xs text-muted">{profile.hasAge ? "Age is locked. Contact support to correct it." : "Set once; it controls which films you see."}</span>
          {err.age && <span className="mt-1 block text-xs text-danger">{err.age}</span>}
        </label>
        <Msg r={pr} />
        <button className="btn btn-primary">Save changes</button>
      </form>

      <div className="space-y-6">
        <div className="panel p-5">
          <h2 className="text-lg font-bold">Your catalogue</h2>
          <p className="mt-2 text-sm text-muted">Showing films for <b className="text-ink">{profile.tierLabel}</b>. Adult-flagged titles are never shown to anyone.</p>
        </div>
        <form onSubmit={savePw} className="panel space-y-4 p-5">
          <h2 className="text-lg font-bold">Change password</h2>
          <input className="input" type="password" placeholder="Current password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} required />
          <input className="input" type="password" placeholder="New password (8+ characters, letter and number)" autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} required />
          <Msg r={pwr} />
          <button className="btn btn-ghost">Update password</button>
        </form>
        <button onClick={signOut} className="btn btn-outline w-full">Sign out</button>
      </div>
    </div>
  );
}
