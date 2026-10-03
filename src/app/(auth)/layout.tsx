import Link from "next/link";
import { ArrowLeft, Navigation, Check, ArrowUpRight } from "lucide-react";
import { Brand } from "@/components/shell/brand";
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-6 sm:px-10">
        <Brand />
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary"
        >
          <ArrowLeft size={14} />
          Back to home
        </Link>
      </header>
      <main
        id="main"
        className="mx-auto grid max-w-[1200px] gap-8 px-6 pb-10 pt-6 lg:min-h-[calc(100svh-120px)] lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-24 lg:pb-16 lg:pt-8"
      >
        <aside className="relative hidden self-stretch border border-border bg-secondary/60 px-10 py-12 lg:flex lg:flex-col lg:justify-between">
          <div className="eyebrow text-primary">
            A little clarity changes everything.
          </div>
          <div className="py-14">
            <div className="relative mx-auto mb-14 flex h-44 w-44 items-center justify-center rounded-full border border-primary/15">
              <div className="absolute inset-5 rounded-full border border-dashed border-primary/25" />
              <div className="absolute inset-10 rounded-full border border-primary/20" />
              <Navigation size={48} strokeWidth={1} className="text-primary" />
              <span className="absolute -right-1 top-9 h-3 w-3 rounded-full border-4 border-secondary bg-primary" />
              <span className="absolute bottom-5 left-4 h-2 w-2 rounded-full bg-primary/30" />
            </div>
            <h2 className="text-5xl font-medium leading-[1.08] tracking-[-.065em]">
              Your next step,
              <br />
              <span className="text-primary">a little clearer.</span>
            </h2>
            <p className="mt-6 max-w-xs text-sm leading-7 text-muted-foreground">
              A thoughtful space for your dental plan, your care, and the
              decisions ahead.
            </p>
          </div>
          <div className="space-y-3 border-t border-primary/15 pt-6">
            {[
              "Your current plan, in focus",
              "Your dentist’s guidance, respected",
              "Your next move, informed",
            ].map((t) => (
              <p
                key={t}
                className="flex items-center gap-3 text-xs text-muted-foreground"
              >
                <Check size={13} className="text-primary" />
                {t}
              </p>
            ))}
          </div>
        </aside>
        <section className="reveal mx-auto w-full max-w-[410px] py-8 sm:py-14">
          <div className="mb-9 flex h-11 w-11 items-center justify-center border border-primary/20 bg-card text-primary">
            <ArrowUpRight size={22} strokeWidth={1.5} />
          </div>
          {children}
          <p className="mt-10 border-t border-border pt-5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            AI proposes. You verify. Code computes.
          </p>
        </section>
      </main>
    </div>
  );
}
