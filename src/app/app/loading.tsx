export default function Loading() {
  return (
    <div role="status" aria-label="Loading workspace" className="space-y-5">
      <div className="h-9 w-2/3 rounded-xl bg-border" />
      <div className="h-56 rounded-2xl bg-border" />
      <span className="sr-only">Loading workspace…</span>
    </div>
  );
}
