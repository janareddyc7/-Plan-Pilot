import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  FileText,
  CalendarDays,
  ListChecks,
} from "lucide-react";
import { Brand } from "@/components/shell/brand";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
export default async function Home() {
  const client = await createClient();
  let signedIn = false;
  try {
    signedIn = !!(await client?.auth.getUser())?.data.user;
  } catch {
    /* Public home remains available offline. */
  }
  return (
    <div className="min-h-svh">
      <header className="mx-auto flex max-w-6xl items-center justify-between border-b border-border px-6 py-5">
        <Brand />
        <div className="flex items-center gap-5">
          <Button asChild variant="outline">
            <Link href={signedIn ? "/app" : "/sign-in"}>
              {signedIn ? "Open dashboard" : "Sign in"}
              <ArrowUpRight size={13} />
            </Link>
          </Button>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-6xl px-6">
        <section className="grid items-center gap-12 py-16 md:grid-cols-[1.1fr_1fr] md:gap-20 md:py-24">
          <div>
            <p className="text-[10px] uppercase tracking-[.2em] text-primary">
              Dental benefits, considered.
            </p>
            <h1 className="mt-5 font-serif text-5xl leading-[1.1] tracking-tight md:text-6xl">
              A clearer plan.
              <br />
              <span className="italic text-primary">A calmer you.</span>
            </h1>
            <p className="mt-6 max-w-sm text-sm leading-7 text-muted-foreground">
              Understand your coverage. Explore the timing of your care. See
              what every estimate is made of.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild>
                <Link href={signedIn ? "/app" : "/sign-up"}>
                  {signedIn ? "Go to dashboard" : "Create account"}
                  <ArrowRight size={14} />
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-[11px] text-muted-foreground">
              Your workspace starts with your own benefits summary.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 shadow-preview">
            <div className="flex justify-between border-b border-border pb-4 text-[10px] text-muted-foreground">
              <span>Your planning notebook</span>
              <span>01 / 03</span>
            </div>
            <h2 className="mt-7 font-serif text-3xl">
              Everything in its place.
            </h2>
            <p className="mt-3 text-xs leading-6 text-muted-foreground">
              From coverage details to the next appointment.
            </p>
            <div className="mt-7 space-y-1">
              {[
                {
                  icon: FileText,
                  label: "Your plan",
                  copy: "Coverage, deductible, annual maximum",
                },
                {
                  icon: CalendarDays,
                  label: "Your care",
                  copy: "Procedure costs and approved dates",
                },
                {
                  icon: ListChecks,
                  label: "Your options",
                  copy: "Compare schedules, inspect estimates",
                },
              ].map(({ icon: Icon, label, copy }, i) => (
                <div
                  key={label}
                  className="flex items-center gap-4 border-t border-border py-4"
                >
                  <span className="flex size-9 items-center justify-center rounded-md bg-secondary/50 text-primary">
                    <Icon size={17} strokeWidth={1.5} />
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-medium">{label}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {copy}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    0{i + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="grid gap-6 border-y border-border py-7 sm:grid-cols-3">
          {[
            [
              "Clarity over complexity",
              "See how your plan applies to your treatment.",
            ],
            [
              "Timing with care",
              "Explore dates within dentist-approved windows.",
            ],
            [
              "Every estimate explained",
              "Inspect the fees and rules behind each calculation.",
            ],
          ].map(([title, copy]) => (
            <div key={title}>
              <h2 className="text-xs font-medium">{title}</h2>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">
                {copy}
              </p>
            </div>
          ))}
        </section>
      </main>
      <footer className="mx-auto flex max-w-6xl flex-wrap justify-between gap-3 px-6 py-7 text-[10px] text-muted-foreground">
        <span>PlanPilot · Your benefits. Your decisions.</span>
        <span>Estimates for planning. Confirm coverage with your insurer.</span>
      </footer>
    </div>
  );
}
