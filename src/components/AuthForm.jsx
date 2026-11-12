"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AuthForm({ mode }) {
  const isSignup = mode === "signup";
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState({ ok: false, text: "" });
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg({ ok: false, text: "" });
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      setMsg({ ok: data.success, text: data.message });
      if (data.success) {
        router.push("/");
        router.refresh();
      }
    } catch {
      setMsg({ ok: false, text: "Network error, try again" });
    } finally {
      setLoading(false);
    }
  }

  const input = "w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent";
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-3xl font-extrabold text-yellow-600">{isSignup ? "Create account" : "Welcome back"}</h1>
        {msg.text && <p className={msg.ok ? "text-green-600" : "text-red-500"}>{msg.text}</p>}
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
        <input type="password" required minLength={6} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
        <button type="submit" disabled={loading} className="w-full bg-orange-600 text-white p-3 rounded-md disabled:opacity-60">
          {loading ? "Please wait…" : isSignup ? "Sign up" : "Sign in"}
        </button>
        <p className="text-center">
          {isSignup ? (<>Have an account? <Link href="/signin" className="text-yellow-600">Sign in</Link></>) : (<>New here? <Link href="/signup" className="text-yellow-600">Sign up</Link></>)}
        </p>
      </form>
    </div>
  );
}
