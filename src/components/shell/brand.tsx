import Link from "next/link";
export function Brand() {
  return (
    <Link
      href="/"
      aria-label="Lincoln Financial PlanPilot"
      className="inline-flex items-center gap-2.5 tracking-tight"
    >
      <span className="flex size-8 items-center justify-center rounded-sm bg-primary text-primary-foreground shadow-control">
        <span className="font-serif text-lg leading-none" aria-hidden="true">L</span>
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em]">Lincoln Financial</span>
        <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.18em] text-primary">PlanPilot</span>
      </span>
    </Link>
  );
}
