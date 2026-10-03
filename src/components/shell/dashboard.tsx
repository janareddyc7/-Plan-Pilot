import { EmptyState } from "./empty-state";
export function Dashboard() {
  return (
    <>
      <p className="text-xs font-medium uppercase tracking-widest text-primary">
        Your planning space
      </p>
      <h1 className="mt-3 text-3xl font-medium tracking-tight">
        A little clarity goes a long way.
      </h1>
      <p className="mb-8 mt-3 text-muted-foreground">
        One place for your plan, care, and what comes next.
      </p>
      <EmptyState
        title="Your workspace is ready to grow."
        description="Plan entry and the interactive simulator are coming next. This preview gives you a look at your workspace; no financial estimates have been generated."
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          "01 · Confirm your plan",
          "02 · Add recommended care",
          "03 · Explore timing options",
        ].map((t) => (
          <div key={t} className="rounded-md border border-border bg-card p-6">
            <p className="text-sm font-medium">{t}</p>
            <p className="mt-3 text-xs text-muted-foreground">In development</p>
          </div>
        ))}
      </div>
    </>
  );
}
