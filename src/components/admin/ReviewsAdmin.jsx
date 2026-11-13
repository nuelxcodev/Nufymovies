"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "./useAdminApi";

export default function ReviewsAdmin() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ reviews: [], pages: 1 });
  const load = useCallback(async () => {
    const r = await api(`/api/admin/reviews?page=${page}`);
    if (r.success) setData(r);
  }, [page]);
  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <h1 className="mb-5 text-3xl font-extrabold">Reviews</h1>
      <ul className="space-y-3">
        {data.reviews.map((r) => (
          <li key={r.id} className={`panel p-4 ${r.hidden ? "opacity-60" : ""}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm"><b>{r.username}</b> on <a className="underline" href={`/movies/${r.tmdbId}`}>{r.movieTitle || r.tmdbId}</a> · {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
              <div className="flex gap-1.5">
                <button className="btn btn-ghost px-2.5 py-1 text-xs" onClick={async () => { await api(`/api/admin/reviews/${r.id}`, "PATCH", { hidden: !r.hidden }); load(); }}>{r.hidden ? "Show" : "Hide"}</button>
                <button className="btn btn-danger px-2.5 py-1 text-xs" onClick={async () => { if (confirm("Delete this review?")) { await api(`/api/admin/reviews/${r.id}`, "DELETE"); load(); } }}>Delete</button>
              </div>
            </div>
            {r.comment && <p className="mt-2 text-sm text-muted">{r.comment}</p>}
          </li>
        ))}
        {!data.reviews.length && <li className="text-sm text-muted">No reviews yet.</li>}
      </ul>
      <div className="mt-4 flex items-center justify-between text-sm">
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn btn-outline">Previous</button>
        <span className="text-muted">Page {page} of {data.pages}</span>
        <button disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)} className="btn btn-outline">Next</button>
      </div>
    </div>
  );
}
