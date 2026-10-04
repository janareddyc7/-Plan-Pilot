import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Brand } from "@/components/shell/brand";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border/60 px-6 py-5 md:px-10">
        <Brand />
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={13} /> Home
        </Link>
      </header>
      <main
        id="main"
        className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-16 px-6 py-10 lg:grid-cols-2 lg:gap-28"
      >
        <aside className="hidden py-12 lg:block">
          <span className="text-[10px] uppercase tracking-[.2em] text-muted-foreground">
            A clearer kind of planning
          </span>
          <h2 className="mt-6 font-serif text-[44px] font-normal leading-[1.15] tracking-tight">
            Good care.
            <br />
            Thoughtful timing.
            <br />
            <span className="italic text-primary">Room to breathe.</span>
          </h2>
          <p className="mt-6 max-w-xs text-sm leading-7 text-muted-foreground">
            Understand your dental benefits and see how your care fits together.
          </p>
          <div className="mt-10 border-y border-border py-5">
            {[
              "Review your coverage",
              "Explore treatment dates",
              "Understand every estimate",
            ].map((text, i) => (
              <div key={text} className="flex items-center gap-4 py-2 text-xs">
                <span className="font-mono text-primary">0{i + 1}</span>
                {text}
              </div>
            ))}
          </div>
          <Link
            href="/demo"
            className="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Explore the public preview <ArrowUpRight size={13} />
          </Link>
        </aside>
        <section className="mx-auto w-full max-w-sm rounded-lg border border-border bg-card px-7 py-8 shadow-control sm:px-8">
          {children}
          <p className="mt-7 border-t border-border pt-4 text-[11px] text-muted-foreground">
            Your benefits. Your decisions.
          </p>
        </section>
      </main>
      <footer className="px-6 py-5 text-center text-[11px] text-muted-foreground">
        PlanPilot · Dental benefits, considered.
      </footer>
    </div>
  );
}
