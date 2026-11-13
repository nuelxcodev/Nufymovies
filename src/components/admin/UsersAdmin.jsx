"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "./useAdminApi";
import { countryName } from "@/lib/countries";

const d = (x) => (x ? new Date(x).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" }) : "—");

export default function UsersAdmin() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ users: [], pages: 1, total: 0 });
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await api(`/api/admin/users?q=${encodeURIComponent(q)}&page=${page}&status=${status}`);
    if (r.success) setData(r);
    else setNote(r.message);
    setLoading(false);
  }, [q, page, status]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  const patch = async (id, body, ok) => {
    const r = await api(`/api/admin/users/${id}`, "PATCH", body);
    setNote(r.success ? ok : r.message);
    if (r.success) load();
  };
  const del = async (u) => {
    if (!confirm(`Delete ${u.username || u.email}? This removes their account, list and reviews.`)) return;
    const r = await api(`/api/admin/users/${u.id}`, "DELETE");
    setNote(r.message);
    if (r.success) load();
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-extrabold">Users <span className="text-lg font-medium text-muted">{data.total}</span></h1>
        <div className="flex flex-wrap gap-2">
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search name, email or phone" className="input w-64" aria-label="Search users" />
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input w-auto" aria-label="Filter by status">
            <option value="">All</option><option value="suspended">Suspended</option>
          </select>
        </div>
      </div>
      {note && <p role="status" className="mb-3 text-sm text-muted">{note}</p>}
      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-line text-muted"><tr>{["User", "Phone", "Country", "Age", "Joined", "Last seen", "Status", ""].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {data.users.map((u) => (
              <tr key={u.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3"><p className="font-semibold">{u.username || "—"}</p><p className="text-xs text-muted">{u.email}</p></td>
                <td className="px-4 py-3">{u.phone || "—"}</td>
                <td className="px-4 py-3">{countryName(u.country) || "—"}</td>
                <td className="px-4 py-3">{u.age ?? "—"}</td>
                <td className="px-4 py-3">{d(u.createdAt)}</td>
                <td className="px-4 py-3">{d(u.lastLoginAt)}</td>
                <td className="px-4 py-3"><span className={`chip ${u.status === "active" ? "chip-good" : "bg-danger/15 text-danger"}`}>{u.status}</span></td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap justify-end gap-1.5">
                    <button className="btn btn-ghost px-2.5 py-1 text-xs" onClick={() => patch(u.id, { status: u.status === "active" ? "suspended" : "active" }, u.status === "active" ? "User suspended" : "User reactivated")}>{u.status === "active" ? "Suspend" : "Reactivate"}</button>
                    <button className="btn btn-ghost px-2.5 py-1 text-xs" onClick={() => { const a = prompt("New age for this user", u.age ?? ""); if (a) patch(u.id, { age: Number(a) }, "Age updated"); }}>Edit age</button>
                    <button className="btn btn-ghost px-2.5 py-1 text-xs" onClick={() => { const p = prompt("Set a temporary password (8+ characters)"); if (p) patch(u.id, { newPassword: p }, "Password reset"); }}>Reset password</button>
                    <button className="btn btn-danger px-2.5 py-1 text-xs" onClick={() => del(u)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && !data.users.length && <tr><td colSpan={8} className="px-4 py-8 text-center text-muted">No users match.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn btn-outline">Previous</button>
        <span className="text-muted">Page {page} of {data.pages}</span>
        <button disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)} className="btn btn-outline">Next</button>
      </div>
    </div>
  );
}
