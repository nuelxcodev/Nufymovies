"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { COUNTRIES } from "@/lib/countries";

const Field = ({ label, error, children, hint }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-medium">{label}</span>
    {children}
    {hint && !error && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    {error && <span role="alert" className="mt-1 block text-xs text-danger">{error}</span>}
  </label>
);

export default function AuthForm({ mode }) {
  const isSignup = mode === "signup";
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [v, setV] = useState({ username: "", email: "", identifier: "", password: "", phone: "", country: "NG", age: "" });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setMsg("");
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isSignup ? { ...v, age: Number(v.age) } : { identifier: v.identifier, password: v.password }),
      });
      const data = await res.json();
      if (data.success) {
        const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
        router.push(data.redirect === "/admin" ? "/admin" : safeNext || data.redirect || "/");
        router.refresh();
        return;
      }
      setErrors(data.errors || {});
      setMsg(data.message || "Something went wrong");
    } catch {
      setMsg("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden overflow-hidden bg-surface md:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgb(var(--brand)/0.28),transparent_55%)]" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" className="font-display text-3xl font-extrabold text-brand">nufy</Link>
          <div>
            <h2 className="max-w-md font-display text-5xl font-extrabold leading-[1.05]">Watch it. Download it. Take it with you.</h2>
            <p className="mt-5 max-w-md text-lg text-muted">Free full-length films, trailers for everything else, and a catalogue matched to your age.</p>
          </div>
          <p className="text-sm text-muted">Free films from the Internet Archive · Trailers via TMDB</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-10">
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4" noValidate>
          <Link href="/" className="font-display text-2xl font-extrabold text-brand md:hidden">nufy</Link>
          <h1 className="text-3xl font-extrabold">{isSignup ? "Create your account" : "Welcome back"}</h1>
          {msg && <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{msg}</p>}

          {isSignup ? (
            <>
              <Field label="Username" error={errors.username}><input className="input" autoComplete="username" value={v.username} onChange={set("username")} required /></Field>
              <Field label="Email" error={errors.email}><input className="input" type="email" autoComplete="email" value={v.email} onChange={set("email")} required /></Field>
              <Field label="Phone number" error={errors.phone} hint="Include your country code"><input className="input" type="tel" autoComplete="tel" placeholder="+234 801 234 5678" value={v.phone} onChange={set("phone")} required /></Field>
              <div className="grid grid-cols-[1fr_96px] gap-3">
                <Field label="Country" error={errors.country}>
                  <select className="input" value={v.country} onChange={set("country")} autoComplete="country">
                    {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="Age" error={errors.age}><input className="input" type="number" inputMode="numeric" min={5} max={120} value={v.age} onChange={set("age")} required /></Field>
              </div>
              <p className="-mt-1 text-xs text-muted">Your age decides which films we show you. It can&apos;t be changed later without an admin.</p>
              <Field label="Password" error={errors.password} hint="8+ characters with a letter and a number">
                <div className="relative">
                  <input className="input pr-16" type={show ? "text" : "password"} autoComplete="new-password" value={v.password} onChange={set("password")} required />
                  <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted hover:text-ink">{show ? "Hide" : "Show"}</button>
                </div>
              </Field>
            </>
          ) : (
            <>
              <Field label="Username or email"><input className="input" autoComplete="username" value={v.identifier} onChange={set("identifier")} required autoFocus /></Field>
              <Field label="Password">
                <div className="relative">
                  <input className="input pr-16" type={show ? "text" : "password"} autoComplete="current-password" value={v.password} onChange={set("password")} required />
                  <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted hover:text-ink">{show ? "Hide" : "Show"}</button>
                </div>
              </Field>
            </>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary w-full py-3">{loading ? "Please wait…" : isSignup ? "Create account" : "Sign in"}</button>
          <p className="text-center text-sm text-muted">
            {isSignup ? <>Already have an account? <Link href="/signin" className="font-semibold text-brand">Sign in</Link></> : <>New here? <Link href="/signup" className="font-semibold text-brand">Create an account</Link></>}
          </p>
        </form>
      </div>
    </div>
  );
}
