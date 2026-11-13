"use client";
import { useCallback, useEffect, useState } from "react";
import { BsStar, BsStarFill } from "react-icons/bs";
import { useProfile } from "./ProfileProvider";

const Stars = ({ value, onPick, size = 18 }) => (
  <span className="inline-flex gap-0.5" role={onPick ? "radiogroup" : undefined} aria-label={`${value} out of 5`}>
    {[1, 2, 3, 4, 5].map((n) => {
      const Icon = n <= value ? BsStarFill : BsStar;
      return onPick ? (
        <button key={n} type="button" onClick={() => onPick(n)} role="radio" aria-checked={n === value} aria-label={`${n} star${n > 1 ? "s" : ""}`} className="text-brand"><Icon size={size} /></button>
      ) : (
        <Icon key={n} size={size} className="text-brand" />
      );
    })}
  </span>
);

export default function Reviews({ tmdbId, title }) {
  const { me } = useProfile();
  const [data, setData] = useState({ avg: 0, count: 0, reviews: [] });
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const r = await fetch(`/api/movies/${tmdbId}/reviews`).catch(() => null);
    const d = r ? await r.json().catch(() => null) : null;
    if (d?.success) {
      setData(d);
      const mine = d.reviews.find((x) => x.mine);
      if (mine) {
        setRating(mine.rating);
        setComment(mine.comment);
      }
    }
  }, [tmdbId]);
  useEffect(() => { load(); }, [load]);

  async function submit(e) {
    e.preventDefault();
    if (!rating) return setMsg("Pick a star rating first");
    const r = await fetch(`/api/movies/${tmdbId}/reviews`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rating, comment, title }),
    }).catch(() => null);
    const d = r ? await r.json().catch(() => ({})) : {};
    setMsg(d.message || "Network error, try again");
    if (d.success) load();
  }
  async function remove() {
    await fetch(`/api/movies/${tmdbId}/reviews`, { method: "DELETE" }).catch(() => null);
    setRating(0); setComment(""); setMsg(""); load();
  }

  const mine = data.reviews.find((r) => r.mine);
  return (
    <section className="page mt-12" aria-label="Reviews">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-xl font-bold md:text-2xl">Member reviews</h2>
        {data.count > 0 && <span className="flex items-center gap-2 text-sm text-muted"><Stars value={Math.round(data.avg)} size={14} /> {data.avg} · {data.count}</span>}
      </div>
      <div className="grid gap-6 md:grid-cols-[360px_1fr]">
        {me?.canSave ? (
          <form onSubmit={submit} className="panel space-y-3 p-4">
            <p className="text-sm font-semibold">{mine ? "Your review" : "Rate this film"}</p>
            <Stars value={rating} onPick={setRating} size={24} />
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} rows={3} placeholder="What did you think? (optional)" className="input" />
            {msg && <p className="text-sm text-muted">{msg}</p>}
            <div className="flex gap-2">
              <button className="btn btn-primary">{mine ? "Update review" : "Post review"}</button>
              {mine && <button type="button" onClick={remove} className="btn btn-ghost">Delete</button>}
            </div>
          </form>
        ) : <div />}
        <ul className="space-y-3">
          {data.reviews.length === 0 && <li className="text-sm text-muted">No reviews yet. Be the first to rate it.</li>}
          {data.reviews.map((r) => (
            <li key={r.id} className="panel p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">{r.username}{r.mine && <span className="chip ml-2">You</span>}</span>
                <Stars value={r.rating} size={13} />
              </div>
              {r.comment && <p className="mt-2 text-sm text-muted">{r.comment}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
