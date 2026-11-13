"use client";
import { useState } from "react";
import { BsFlag } from "react-icons/bs";

const TYPES = [
  ["broken", "Video won't play or download"],
  ["wrong_age", "Wrong age rating"],
  ["inappropriate", "Inappropriate content"],
  ["copyright", "Copyright concern"],
  ["other", "Something else"],
];

export default function ReportButton({ item }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("broken");
  const [message, setMessage] = useState("");
  const [state, setState] = useState({ busy: false, text: "", ok: false });

  async function submit(e) {
    e.preventDefault();
    setState({ busy: true, text: "", ok: false });
    const r = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: item.key, href: item.href, title: item.title, type, message }),
    }).catch(() => null);
    const d = r ? await r.json().catch(() => ({})) : {};
    setState({ busy: false, ok: Boolean(d.success), text: d.message || "Network error, try again" });
    if (d.success) setTimeout(() => setOpen(false), 1400);
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn btn-ghost"><BsFlag size={14} /> Report</button>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-4 sm:items-center" role="dialog" aria-modal="true" aria-label="Report a problem" onClick={() => setOpen(false)}>
          <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="panel w-full max-w-md space-y-4 p-5">
            <h2 className="text-lg font-bold">Report a problem</h2>
            <label className="block text-sm">
              <span className="mb-1 block text-muted">What&apos;s wrong?</span>
              <select value={type} onChange={(e) => setType(e.target.value)} className="input">
                {TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-muted">Details (optional)</span>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} rows={3} className="input" />
            </label>
            {state.text && <p className={`text-sm ${state.ok ? "text-good" : "text-danger"}`}>{state.text}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost">Cancel</button>
              <button disabled={state.busy} className="btn btn-primary">{state.busy ? "Sending…" : "Send report"}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
