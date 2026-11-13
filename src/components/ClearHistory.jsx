"use client";
import { useRouter } from "next/navigation";

export default function ClearHistory() {
  const router = useRouter();
  return (
    <button
      className="text-sm font-medium text-muted hover:text-ink"
      onClick={async () => {
        await fetch("/api/me/history", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: "{}" }).catch(() => {});
        router.refresh();
      }}
    >
      Clear history
    </button>
  );
}
