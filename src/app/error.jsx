"use client";

export default function Error({ reset }) {
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-6 text-center">
      <div>
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-muted">It&apos;s on our side. Try again in a moment.</p>
        <button onClick={reset} className="btn btn-primary mt-6">Try again</button>
      </div>
    </main>
  );
}
