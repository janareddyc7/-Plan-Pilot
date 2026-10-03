import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  FileText,
  CalendarDays,
  ScanLine,
  Plus,
  LockKeyhole,
  Command,
  MoveRight,
} from "lucide-react";
import { Brand } from "@/components/shell/brand";
import { Button } from "@/components/ui/button";
const steps = [
  {
    icon: FileText,
    title: "Understand the fine print.",
    copy: "Bring your plan details together. Know which rules matter before making a decision.",
  },
  {
    icon: CalendarDays,
    title: "See how timing fits.",
    copy: "Explore benefit years while keeping your dentist’s guidance at the center.",
  },
  {
    icon: ScanLine,
    title: "Follow every number.",
    copy: "A clear path from confirmed plan rules to an estimate you can inspect.",
  },
];
export default function Home() {
  return (
    <div className="overflow-hidden">
      <header className="mx-auto flex max-w-[1280px] items-center justify-between border-b border-border px-5 py-5 sm:px-10">
        <Brand />
        <nav
          aria-label="Main navigation"
          className="flex items-center gap-3 sm:gap-7"
        >
          <Link
            href="#approach"
            className="hidden text-sm text-muted-foreground hover:text-foreground md:block"
          >
            The approach
          </Link>
          <Link
            href="/sign-in"
            className="hidden whitespace-nowrap text-sm font-medium min-[380px]:block"
          >
            Sign in
          </Link>
          <Button asChild className="px-3 sm:px-5">
            <Link href="/sign-up">
              Get started <ArrowUpRight size={15} />
            </Link>
          </Button>
        </nav>
      </header>
      <main id="main">
        <section className="relative mx-auto grid max-w-[1280px] items-center gap-12 px-5 pb-16 pt-16 sm:px-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pb-24 lg:pt-24">
          <div className="reveal">
            <div className="mb-7 inline-flex items-center gap-2.5 border border-primary/20 bg-card px-3 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="eyebrow text-primary">
                A clearer kind of dental planning
              </span>
            </div>
            <h1 className="text-[clamp(3.4rem,6vw,5.5rem)] font-medium leading-[.99] tracking-[-.075em]">
              Less fine print.
              <br />
              More <span className="text-primary">foresight.</span>
            </h1>
            <p className="mt-7 max-w-[410px] text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              Make sense of your dental benefits.
              <br className="hidden sm:block" /> Bring your plan, care, and next
              steps into focus.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild className="min-h-12 px-6">
                <Link href="/sign-up">
                  Create your workspace <ArrowRight size={17} />
                </Link>
              </Button>
              <Button asChild variant="outline" className="min-h-12">
                <Link href="/demo">
                  Take a look <ArrowUpRight size={16} />
                </Link>
              </Button>
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
              <Check size={13} />
              <span>No credit card. A little more clarity.</span>
            </div>
          </div>
          <div
            className="reveal relative lg:pt-6"
            style={{ animationDelay: "120ms" }}
          >
            <div
              aria-hidden="true"
              className="dot-grid absolute -inset-8 -z-10"
            />
            <div className="border border-border bg-card shadow-preview">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <Command size={14} className="text-primary" />
                  Your benefit flight plan
                </div>
                <span className="eyebrow text-muted-foreground">
                  Concept preview
                </span>
              </div>
              <div className="p-5 sm:p-7">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="eyebrow text-muted-foreground">
                      One plan. A wider perspective.
                    </p>
                    <h2 className="mt-3 text-2xl font-medium tracking-tight">
                      See the way forward.
                    </h2>
                  </div>
                  <Plus size={19} className="text-primary" />
                </div>
                <div className="mt-7 grid grid-cols-2 gap-3">
                  <div className="border border-border p-4">
                    <FileText size={18} className="text-primary" />
                    <p className="mt-4 text-sm font-medium">Your benefits</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Clear, confirmed rules
                    </p>
                  </div>
                  <div className="border border-border p-4">
                    <CalendarDays size={18} className="text-primary" />
                    <p className="mt-4 text-sm font-medium">Your treatment</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Dentist-approved timing
                    </p>
                  </div>
                </div>
                <div className="mt-7 border border-border">
                  <div className="flex justify-between border-b border-border px-4 py-3 font-mono text-[10px] uppercase tracking-wider">
                    <span>Plan → possibilities</span>
                    <span className="text-primary">Your pace</span>
                  </div>
                  <div className="relative grid grid-cols-3 gap-3 px-4 py-6">
                    <div
                      aria-hidden="true"
                      className="absolute left-8 right-8 top-9 border-t border-dashed border-primary/35"
                    />
                    {["Review", "Understand", "Explore"].map((t, i) => (
                      <div key={t} className="relative">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] ${i === 0 ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-primary"}`}
                        >
                          {i === 0 ? (
                            <Check size={12} />
                          ) : (
                            String(i + 1).padStart(2, "0")
                          )}
                        </div>
                        <p className="mt-3 text-xs font-medium">{t}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <LockKeyhole size={12} />
                  Your decisions stay yours.
                </div>
              </div>
            </div>
            <p className="mt-5 text-right font-mono text-[10px] text-muted-foreground">
              EARLY ACCESS / SIMULATOR IN DEVELOPMENT
            </p>
          </div>
        </section>
        <div className="border-y border-border bg-secondary/45">
          <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-5 px-5 py-6 sm:px-10">
            <p className="eyebrow text-muted-foreground">
              Built around one simple principle
            </p>
            <p className="flex flex-wrap items-center gap-3 text-sm font-medium sm:gap-6">
              AI proposes.
              <MoveRight size={15} className="text-primary" />
              You verify.
              <MoveRight size={15} className="text-primary" />
              Code computes.
            </p>
          </div>
        </div>
        <section
          id="approach"
          className="mx-auto max-w-[1280px] px-5 py-16 sm:px-10 sm:py-20"
        >
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-primary">The approach</p>
              <h2 className="mt-3 text-3xl font-medium tracking-[-.045em] sm:text-4xl">
                A better view of what’s next.
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-6 text-muted-foreground">
              Designed to make complex benefits feel a little more human.
            </p>
          </div>
          <div className="grid border-l border-t border-border md:grid-cols-3">
            {steps.map(({ icon: Icon, title, copy }, i) => (
              <article
                key={title}
                className="border-b border-r border-border bg-card/60 p-7"
              >
                <div className="flex justify-between">
                  <Icon size={22} strokeWidth={1.5} className="text-primary" />
                  <span className="font-mono text-xs text-muted-foreground">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-8 text-lg font-medium tracking-tight">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {copy}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer className="mx-auto max-w-[1280px] border-t border-border px-5 py-8 sm:px-10">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <Brand />
          <span className="eyebrow text-muted-foreground">
            Your benefits. Your decisions.
          </span>
        </div>
        <p className="mt-6 max-w-3xl text-[11px] leading-5 text-muted-foreground">
          Educational estimates based on supplied plan rules and fees. Verify
          coverage, procedure coding, network status, claim date, and clinical
          scheduling with your insurer and dentist.
        </p>
      </footer>
    </div>
  );
}
