import Link from "next/link";

export default function Maintenance() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 text-center">
      <div className="max-w-md">
        <h1 className="text-4xl font-extrabold">Back in a moment</h1>
        <p className="mt-3 text-muted">Nufy is being updated. Everything will be back shortly, and your list and progress are safe.</p>
        <Link href="/signin" className="mt-6 inline-block text-sm text-muted underline">Staff sign in</Link>
      </div>
    </main>
  );
}
