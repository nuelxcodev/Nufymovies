"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "./useAdminApi";

const LABEL = { broken: "Won't play / download", wrong_age: "Wrong age rating", inappropriate: "Inappropriate", copyright: "Copyright", other: "Other" };

export default function ReportsAdmin() {
  const [status, setStatus] = useState("open");
  const [rows, setRows] = useState([]);
  const load = useCallback(async () => {
    const r = await api(`/api/admin/reports?status=${status}`);
    if (r.success) setRows(r.reports);
  }, [status]);
  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold">Reports</h1>
        <div className="flex gap-2">{["open", "resolved"].map((s) => <button key={s} onClick={() => setStatus(s)} className={`chip px-3 py-1.5 text-sm capitalize ${status === s ? "chip-brand" : ""}`}>{s}</button>)}</div>
      </div>
      <p className="mb-4 max-w-2xl text-sm text-muted">For copyright or wrong-age reports, open the film and use Content to hide it or set a minimum age.</p>
      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={r.id} className="panel p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm"><span className="chip mr-2">{LABEL[r.type]}</span><a className="font-semibold underline" href={r.href}>{r.title}</a> <span className="text-muted">· from {r.username || "member"} · {new Date(r.createdAt).toLocaleDateString("en-GB")}</span></p>
              <div className="flex gap-1.5">
                <button className="btn btn-ghost px-2.5 py-1 text-xs" onClick={async () => { await api(`/api/admin/reports/${r.id}`, "PATCH", { status: status === "open" ? "resolved" : "open" }); load(); }}>{status === "open" ? "Mark resolved" : "Reopen"}</button>
                <button className="btn btn-danger px-2.5 py-1 text-xs" onClick={async () => { await api(`/api/admin/reports/${r.id}`, "DELETE"); load(); }}>Delete</button>
              </div>
            </div>
            {r.message && <p className="mt-2 text-sm text-muted">“{r.message}”</p>}
          </li>
        ))}
        {!rows.length && <li className="text-sm text-muted">Nothing {status} right now.</li>}
      </ul>
    </div>
  );
}
