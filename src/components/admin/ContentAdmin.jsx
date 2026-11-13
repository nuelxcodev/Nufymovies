"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "./useAdminApi";

const EMPTY = { hidden: false, featured: false, minAge: 0, archiveId: "", note: "" };

export default function ContentAdmin() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [rules, setRules] = useState([]);
  const [sel, setSel] = useState(null); // { tmdbId, title, poster, ...EMPTY }
  const [aq, setAq] = useState("");
  const [aRes, setARes] = useState([]);
  const [note, setNote] = useState("");

  const loadRules = useCallback(async () => {
    const r = await api("/api/admin/movies");
    if (r.success) setRules(r.overrides);
  }, []);
  useEffect(() => { loadRules(); }, [loadRules]);

  const search = async (e) => {
    e.preventDefault();
    const r = await api(`/api/admin/tmdb-search?q=${encodeURIComponent(q)}`);
    setResults(r.items || []);
    if (!r.success) setNote(r.message);
  };
  const pick = (m) => {
    const existing = rules.find((x) => x.tmdbId === (m.tmdbId ?? m.id));
    setSel({ tmdbId: m.tmdbId ?? m.id, title: m.title, poster: m.poster, ...EMPTY, ...(existing || {}) });
    setARes([]); setAq(m.title || "");
  };
  const save = async (e) => {
    e.preventDefault();
    const r = await api("/api/admin/movies", "PUT", sel);
    setNote(r.message);
    if (r.success) { setSel(null); loadRules(); }
  };
  const remove = async (id) => {
    const r = await api(`/api/admin/movies/${id}`, "DELETE");
    setNote(r.message);
    loadRules();
  };
  const archiveSearch = async () => {
    const r = await api(`/api/admin/archive-search?q=${encodeURIComponent(aq)}`);
    setARes(r.items || []);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold">Content</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">Find any film to hide it, feature it on the home hero, require a minimum age, or pin the exact free copy to stream.</p>
      </div>
      {note && <p role="status" className="text-sm text-muted">{note}</p>}

      <form onSubmit={search} className="flex max-w-xl gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a film title" className="input" aria-label="Search films" />
        <button className="btn btn-primary">Search</button>
      </form>

      {results.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((m) => (
            <li key={m.id} className="panel flex items-center gap-3 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {m.poster ? <img src={m.poster} alt="" className="h-16 w-11 rounded object-cover" /> : <div className="h-16 w-11 rounded bg-surface2" />}
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{m.title}</p><p className="text-xs text-muted">{m.year || "—"} · TMDB {m.id}</p></div>
              <button onClick={() => pick(m)} className="btn btn-ghost px-3 py-1.5 text-xs">Manage</button>
            </li>
          ))}
        </ul>
      )}

      {sel && (
        <form onSubmit={save} className="panel space-y-4 p-5">
          <h2 className="text-lg font-bold">{sel.title} <span className="text-sm font-normal text-muted">TMDB {sel.tmdbId}</span></h2>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={sel.hidden} onChange={(e) => setSel({ ...sel, hidden: e.target.checked })} /> Hide from everyone</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={sel.featured} onChange={(e) => setSel({ ...sel, featured: e.target.checked })} /> Feature on home</label>
          </div>
          <label className="block max-w-xs text-sm"><span className="mb-1 block text-muted">Minimum age (0 = use rating)</span>
            <input type="number" min={0} max={21} className="input" value={sel.minAge} onChange={(e) => setSel({ ...sel, minAge: e.target.value })} />
          </label>
          <div className="text-sm">
            <span className="mb-1 block text-muted">Pinned free copy (Internet Archive identifier)</span>
            <input className="input max-w-md" value={sel.archiveId} onChange={(e) => setSel({ ...sel, archiveId: e.target.value.trim() })} placeholder="e.g. Nosferatu_1922" />
            <div className="mt-2 flex max-w-md gap-2">
              <input className="input" value={aq} onChange={(e) => setAq(e.target.value)} placeholder="Find an identifier on the Archive" aria-label="Search Internet Archive" />
              <button type="button" onClick={archiveSearch} className="btn btn-ghost">Find</button>
            </div>
            {aRes.length > 0 && (
              <ul className="mt-2 max-w-md space-y-1">
                {aRes.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 rounded-md bg-surface2 px-3 py-2">
                    <span className="truncate">{a.title} <span className="text-xs text-muted">{a.year}</span></span>
                    <span className="flex shrink-0 gap-2">
                      <a href={`https://archive.org/details/${a.id}`} target="_blank" rel="noopener noreferrer" className="text-xs underline">Preview</a>
                      <button type="button" className="text-xs font-semibold text-brand" onClick={() => { setSel({ ...sel, archiveId: a.id }); setARes([]); }}>Use</button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <label className="block text-sm"><span className="mb-1 block text-muted">Internal note</span><input className="input" value={sel.note} onChange={(e) => setSel({ ...sel, note: e.target.value })} maxLength={300} /></label>
          <div className="flex gap-2"><button className="btn btn-primary">Save rules</button><button type="button" onClick={() => setSel(null)} className="btn btn-ghost">Cancel</button></div>
        </form>
      )}

      <section>
        <h2 className="mb-3 text-lg font-bold">Active rules <span className="text-muted">{rules.length}</span></h2>
        {rules.length === 0 ? <p className="text-sm text-muted">No rules yet.</p> : (
          <div className="panel overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-line text-muted"><tr>{["Film", "Rules", ""].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
              <tbody>
                {rules.map((r) => (
                  <tr key={r.tmdbId} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-semibold">{r.title || r.tmdbId}</td>
                    <td className="px-4 py-3"><div className="flex flex-wrap gap-1.5">
                      {r.hidden && <span className="chip bg-danger/15 text-danger">Hidden</span>}
                      {r.featured && <span className="chip chip-brand">Featured</span>}
                      {r.minAge > 0 && <span className="chip">Min age {r.minAge}</span>}
                      {r.archiveId && <span className="chip chip-good">Pinned: {r.archiveId}</span>}
                      {r.note && <span className="text-xs text-muted">{r.note}</span>}
                    </div></td>
                    <td className="px-4 py-3"><div className="flex justify-end gap-1.5">
                      <button className="btn btn-ghost px-2.5 py-1 text-xs" onClick={() => pick(r)}>Edit</button>
                      <button className="btn btn-danger px-2.5 py-1 text-xs" onClick={() => remove(r.tmdbId)}>Remove</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
