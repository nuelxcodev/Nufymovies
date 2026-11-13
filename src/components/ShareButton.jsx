"use client";
import { useState } from "react";
import { BsShare } from "react-icons/bs";

export default function ShareButton({ title }) {
  const [done, setDone] = useState(false);
  const share = async () => {
    const url = window.location.href.split("#")[0];
    try {
      if (navigator.share) await navigator.share({ title, url });
      else {
        await navigator.clipboard.writeText(url);
        setDone(true);
        setTimeout(() => setDone(false), 2000);
      }
    } catch {}
  };
  return (
    <button onClick={share} className="btn btn-ghost"><BsShare size={14} /> {done ? "Link copied" : "Share"}</button>
  );
}
