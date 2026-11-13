import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import AdminNav from "@/components/admin/AdminNav";

export const metadata = { title: "Admin" };

export default async function AdminLayout({ children }) {
  const s = await getSession();
  if (s?.role !== "admin") notFound(); // defence in depth: middleware already blocks this
  return (
    <div className="min-h-screen md:grid md:grid-cols-[220px_1fr]">
      <aside className="border-b border-line bg-surface md:min-h-screen md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-5 py-4 md:block">
          <p className="font-display text-xl font-extrabold text-brand">nufy <span className="text-sm font-semibold text-muted">admin</span></p>
          <Link href="/" className="text-xs text-muted underline md:mt-1 md:block">View site</Link>
        </div>
        <AdminNav />
      </aside>
      <div className="min-w-0 p-4 md:p-8">{children}</div>
    </div>
  );
}
