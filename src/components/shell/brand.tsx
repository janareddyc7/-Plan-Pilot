import Link from "next/link";
import { Navigation } from "lucide-react";
export function Brand() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 text-base font-semibold tracking-tight"
    >
      <span className="rounded-md bg-primary p-1.5 text-primary-foreground">
        <Navigation size={15} aria-hidden="true" />
      </span>
      PlanPilot<span className="text-primary">.</span>
    </Link>
  );
}
