"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const Ctx = createContext({ me: null, saved: {}, releasedCount: 0, save: async () => false, unsave: async () => false });
export const useProfile = () => useContext(Ctx);

const post = (url, method, body) =>
  fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);

// Holds the signed-in profile and My List state so every card/button stays in sync.
export default function ProfileProvider({ signedIn, children }) {
  const [me, setMe] = useState(null);
  const [saved, setSaved] = useState({});
  const [releasedCount, setReleased] = useState(0);

  useEffect(() => {
    if (!signedIn) {
      setMe(null);
      setSaved({});
      return;
    }
    let alive = true;
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d?.success) {
          setMe(d.user);
          setSaved(d.saved || {});
          setReleased(d.releasedCount || 0);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [signedIn]);

  const save = useCallback(async (item, remind = false) => {
    setSaved((s) => ({ ...s, [item.key]: { remind } }));
    const r = await post("/api/me/list", "POST", { ...item, remind });
    if (!r?.ok)
      setSaved((s) => {
        const n = { ...s };
        delete n[item.key];
        return n;
      });
    return Boolean(r?.ok);
  }, []);

  const unsave = useCallback(async (key) => {
    let prev;
    setSaved((s) => {
      prev = s[key];
      const n = { ...s };
      delete n[key];
      return n;
    });
    const r = await post("/api/me/list", "DELETE", { key });
    if (!r?.ok) setSaved((s) => ({ ...s, [key]: prev }));
    return Boolean(r?.ok);
  }, []);

  const value = useMemo(() => ({ me, saved, releasedCount, save, unsave }), [me, saved, releasedCount, save, unsave]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
