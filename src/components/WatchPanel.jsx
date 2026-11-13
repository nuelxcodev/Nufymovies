"use client";
import { useRef, useState } from "react";
import { BsDownload, BsPlayFill, BsExclamationTriangle } from "react-icons/bs";
import ListButton from "./ListButton";

const fmtDate = (d) => (d ? new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : "a date to be announced");

function Trailer({ trailers }) {
  const [i, setI] = useState(0);
  const t = trailers[i];
  return (
    <div>
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
        <iframe
          key={t.key}
          src={`https://www.youtube-nocookie.com/embed/${t.key}?rel=0`}
          title={t.name || "Trailer"}
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          className="h-full w-full border-0"
        />
      </div>
      {trailers.length > 1 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {trailers.map((x, n) => (
            <button key={x.id} onClick={() => setI(n)} className={`chip ${n === i ? "chip-brand" : ""}`}>{x.name?.slice(0, 28) || `Trailer ${n + 1}`}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function FreePlayer({ movie, free, startAt, onFail }) {
  const last = useRef(0);
  const ref = useRef(null);

  const save = (v) => {
    if (!v || !Number.isFinite(v.duration) || v.duration <= 0) return;
    fetch("/api/me/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        key: movie.key, href: movie.href, title: movie.title, poster: movie.poster, backdrop: movie.backdrop,
        genreIds: movie.genreIds, position: v.currentTime, duration: v.duration,
      }),
    }).catch(() => {});
  };
  const onTime = (e) => {
    const now = Date.now();
    if (now - last.current < 20000) return;
    last.current = now;
    save(e.currentTarget);
  };
  const onMeta = (e) => {
    const v = e.currentTarget;
    if (startAt > 10 && startAt < v.duration - 30) v.currentTime = startAt;
  };

  return (
    <div className="overflow-hidden rounded-xl bg-black">
      <video
        ref={ref}
        controls
        playsInline
        preload="metadata"
        poster={movie.backdrop || movie.poster || free.thumb}
        className="aspect-video w-full"
        onLoadedMetadata={onMeta}
        onTimeUpdate={onTime}
        onPause={(e) => save(e.currentTarget)}
        onEnded={(e) => save(e.currentTarget)}
        onError={onFail}
      >
        <source src={free.streamUrl} type={free.streamType} />
        Your browser can&apos;t play this video. Use the download button instead.
      </video>
    </div>
  );
}

export default function WatchPanel({ movie, free, trailers, released, daysUntil, downloadsEnabled, providers, countryName, startAt = 0, tmdbBacked = true }) {
  const hasFree = Boolean(free);
  const hasTrailer = trailers.length > 0;
  const [tab, setTab] = useState(hasFree ? "watch" : "trailer");
  const [failed, setFailed] = useState(false);
  const item = { key: movie.key, href: movie.href, title: movie.title, poster: movie.poster, year: movie.year, genreIds: movie.genreIds, releaseDate: movie.releaseDate };

  const track = () =>
    fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "download", key: movie.key, title: movie.title }), keepalive: true }).catch(() => {});

  const tabBtn = (id, label) => (
    <button onClick={() => setTab(id)} role="tab" aria-selected={tab === id} className={`rounded-md px-3 py-1.5 text-sm font-semibold ${tab === id ? "bg-brand text-brand-ink" : "bg-surface2 text-muted hover:text-ink"}`}>{label}</button>
  );

  return (
    <div>
      {hasFree && hasTrailer && <div className="mb-3 flex gap-2" role="tablist">{tabBtn("watch", "Full film")}{tabBtn("trailer", "Trailer")}</div>}

      {tab === "watch" && hasFree && !failed && <FreePlayer movie={movie} free={free} startAt={startAt} onFail={() => setFailed(true)} />}
      {tab === "watch" && hasFree && failed && (
        <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-xl bg-surface2 p-6 text-center">
          <BsExclamationTriangle size={28} className="text-brand" />
          <p className="font-semibold">This video didn&apos;t load</p>
          <p className="max-w-sm text-sm text-muted">The Internet Archive may be busy. Try again, open it on the Archive, or watch the trailer.</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button onClick={() => setFailed(false)} className="btn btn-primary">Try again</button>
            <a href={free.sourceUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">Open on Archive</a>
            {hasTrailer && <button onClick={() => setTab("trailer")} className="btn btn-ghost">Watch trailer</button>}
          </div>
        </div>
      )}
      {(tab === "trailer" || !hasFree) && hasTrailer && <Trailer trailers={trailers} />}
      {!hasFree && !hasTrailer && (
        <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-surface2 text-center">
          {movie.backdrop && /* eslint-disable-next-line @next/next/no-img-element */ <img src={movie.backdrop} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />}
          <p className="relative max-w-xs px-4 font-semibold">No trailer has been published for this film yet.</p>
        </div>
      )}

      {/* Availability strip: always says clearly what the viewer can do with this title */}
      <div className="panel mt-4 p-4">
        {hasFree && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 font-semibold"><span className="chip chip-good">Free</span> Full film, no subscription</p>
              <p className="mt-1 text-sm text-muted">Public-domain copy from the Internet Archive. Your place is saved as you watch.</p>
            </div>
            {downloadsEnabled && free.files.length > 0 && (
              <details className="relative">
                <summary className="btn btn-primary cursor-pointer list-none"><BsDownload size={15} /> Download</summary>
                <ul className="panel absolute right-0 z-20 mt-2 w-64 p-1 shadow-xl">
                  {free.files.map((f) => (
                    <li key={f.name}>
                      <a href={f.url} download target="_blank" rel="noopener noreferrer" onClick={track} className="flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm hover:bg-surface2">
                        <span className="font-medium">{f.label}</span>
                        <span className="text-xs text-muted">{f.ext} · {f.size}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}

        {!hasFree && released && (
          <div>
            <p className="font-semibold">{hasTrailer ? "Trailer only for now" : "Not available to stream here"}</p>
            <p className="mt-1 text-sm text-muted">We couldn&apos;t find a legal free copy of this film. Recent releases usually aren&apos;t in the public domain.</p>
            {providers && (
              <div className="mt-3">
                <p className="mb-2 text-sm font-medium">Where to watch in {countryName}</p>
                <div className="flex flex-wrap gap-4">
                  {[["stream", "Stream"], ["rent", "Rent"], ["buy", "Buy"]].map(([k, l]) =>
                    providers[k]?.length ? (
                      <div key={k}>
                        <p className="mb-1 text-xs text-muted">{l}</p>
                        <div className="flex gap-1.5">
                          {providers[k].map((p) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={p.id} src={p.logo} alt={p.name} title={p.name} className="h-9 w-9 rounded-md" />
                          ))}
                        </div>
                      </div>
                    ) : null
                  )}
                </div>
                <p className="mt-2 text-xs text-muted">Availability data by JustWatch.</p>
              </div>
            )}
          </div>
        )}

        {!released && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 font-semibold"><span className="chip chip-brand">Coming soon</span> Not released yet</p>
              <p className="mt-1 text-sm text-muted">
                {movie.releaseDate ? `Expected ${fmtDate(movie.releaseDate)}${daysUntil > 0 ? ` · in ${daysUntil} day${daysUntil === 1 ? "" : "s"}` : ""}.` : "Release date not announced."}
                {hasTrailer ? " Watch the trailer above." : ""}
              </p>
            </div>
            {tmdbBacked && <ListButton item={item} remind variant="button" />}
          </div>
        )}
      </div>
    </div>
  );
}
