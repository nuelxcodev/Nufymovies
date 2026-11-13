import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-6 text-center">
      <div>
        <p className="font-display text-7xl font-extrabold text-brand">404</p>
        <h1 className="mt-2 text-2xl font-bold">We can&apos;t find that page</h1>
        <p className="mt-2 text-muted">It may have been removed, or the link is wrong.</p>
        <Link href="/" className="btn btn-primary mt-6">Back to home</Link>
      </div>
    </main>
  );
}
