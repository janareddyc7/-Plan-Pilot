import Link from "next/link";
import { Navigation } from "lucide-react";
export function Brand() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2.5 text-xl font-semibold tracking-tight"
    >
      <span className="rounded-sm bg-primary p-2 text-primary-foreground">
        <Navigation size={19} aria-hidden="true" />
      </span>
      PlanPilot<span className="text-primary">.</span>
    </Link>
  );
}
