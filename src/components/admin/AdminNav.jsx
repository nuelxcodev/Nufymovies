"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const ITEMS = [
  ["/admin", "Overview"],
  ["/admin/users", "Users"],
  ["/admin/content", "Content"],
  ["/admin/reviews", "Reviews"],
  ["/admin/reports", "Reports"],
  ["/admin/settings", "Settings"],
];

export default function AdminNav() {
  const path = usePathname();
  const router = useRouter();
  const signOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/signin");
    router.refresh();
  };
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:block md:space-y-1 md:pb-0" aria-label="Admin">
      {ITEMS.map(([href, label]) => {
        const on = href === "/admin" ? path === href : path.startsWith(href);
        return (
          <Link key={href} href={href} aria-current={on ? "page" : undefined} className={`block whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${on ? "bg-brand text-brand-ink" : "text-muted hover:bg-surface2 hover:text-ink"}`}>
            {label}
          </Link>
        );
      })}
      <button onClick={signOut} className="block whitespace-nowrap rounded-md px-3 py-2 text-left text-sm font-medium text-muted hover:bg-surface2 hover:text-ink md:mt-6 md:w-full">Sign out</button>
    </nav>
  );
}
