import Link from "next/link";
export function Brand() {
  return (
    <Link
      href="/"
      aria-label="PlanPilot home"
      className="group inline-flex items-center gap-3 tracking-tight"
    >
      <span className="flex size-9 items-center justify-center rounded-lg border border-primary/20 bg-primary text-primary-foreground shadow-control transition-transform group-hover:-rotate-3">
        <span className="font-serif text-xl leading-none" aria-hidden="true">P</span>
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-lg font-semibold tracking-[-0.025em]">PlanPilot</span>
        <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Benefits workspace</span>
      </span>
    </Link>
  );
}
