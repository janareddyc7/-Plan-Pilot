import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { BookOpen, CheckCircle2, FileUp, LockKeyhole, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
export default async function Page() {
  const supabase = await createClient();
  const result = await supabase?.auth.getUser();
  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow text-primary">Guide & settings</p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight">A clear path through the numbers.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
          PlanPilot is designed to keep your decisions understandable: source your rules, confirm them, compare timing, then inspect every receipt.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <GuideCard number="01" icon={FileUp} title="Add your benefits" copy="Upload a text-based PDF or enter your annual maximum, deductible, coverage, and renewal date manually." />
        <GuideCard number="02" icon={CheckCircle2} title="Confirm the rules" copy="Review extracted fields and page references. Only confirmed inputs flow into the calculation engine." />
        <GuideCard number="03" icon={BookOpen} title="Compare care" copy="Add treatment windows, choose a schedule, and inspect each procedure receipt before deciding." />
      </div>
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary"><ShieldCheck size={18} /></div>
          <div>
            <h2 className="text-sm font-medium">What the numbers mean</h2>
            <p className="mt-2 max-w-3xl text-xs leading-6 text-muted-foreground">
              PlanPilot applies network adjustments, deductible rules, coverage percentages, and annual maximums deterministically. Gemini can help explain a receipt, but it never invents a dollar amount or chooses your schedule.
            </p>
          </div>
        </div>
      </Card>
      <section className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-2 text-xs font-medium"><LockKeyhole size={14} className="text-primary" /> Your account</div>
          <p className="mt-4 text-[11px] text-muted-foreground">Signed in as</p>
          <p className="mt-1 text-sm">{result?.data.user?.email ?? "Your account"}</p>
          <Link className="mt-5 inline-flex text-xs text-primary underline underline-offset-4" href="/forgot-password">Send a password reset email</Link>
        </Card>
        <Card className="border-dashed bg-transparent p-6">
          <h2 className="text-sm font-medium">Need to start over?</h2>
          <p className="mt-2 text-xs leading-6 text-muted-foreground">Return to Plan & care to update your source document or correct a rule before comparing schedules.</p>
          <Link className="mt-5 inline-flex text-xs text-primary underline underline-offset-4" href="/app/plans">Open Plan & care →</Link>
        </Card>
      </section>
    </div>
  );
}

function GuideCard({ number, icon: Icon, title, copy }: { number: string; icon: typeof FileUp; title: string; copy: string }) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between"><Icon size={18} className="text-primary" /><span className="font-mono text-[10px] text-muted-foreground">{number}</span></div>
      <h2 className="mt-7 font-serif text-2xl">{title}</h2>
      <p className="mt-2 text-xs leading-6 text-muted-foreground">{copy}</p>
    </Card>
  );
}
