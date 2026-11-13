import Link from "next/link";

export default function Pager({ page, totalPages, hrefFor }) {
  if (totalPages <= 1) return null;
  const base = "btn btn-outline min-w-28";
  return (
    <nav className="mt-10 flex items-center justify-between gap-4" aria-label="Pagination">
      {page > 1 ? <Link href={hrefFor(page - 1)} className={base}>Previous</Link> : <span className={`${base} pointer-events-none opacity-40`}>Previous</span>}
      <span className="text-sm text-muted">Page {page} of {totalPages}</span>
      {page < totalPages ? <Link href={hrefFor(page + 1)} className={base}>Next</Link> : <span className={`${base} pointer-events-none opacity-40`}>Next</span>}
    </nav>
  );
}
