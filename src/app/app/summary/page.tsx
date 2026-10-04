"use client";

import Link from "next/link";
import { ArrowLeft, FileDown } from "lucide-react";
import { useSimulatorStore } from "@/store/simulator-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Procedure } from "@/lib/schemas";

const money = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
const date = (value?: string) => value ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`)) : "—";

export default function SummaryPage() {
  const { ready, hasPlan, plan, procedures, currentSchedule, calculation, optimization } = useSimulatorStore();
  if (!ready) return <div className="py-12 text-sm text-muted-foreground">Preparing your summary…</div>;
  if (!hasPlan || !plan.isConfirmed) return <Card className="p-8"><h1 className="font-serif text-2xl">Confirm your plan first.</h1><p className="mt-2 text-xs text-muted-foreground">Return to My plan, confirm the insurance rules, and then export a summary.</p><Button asChild className="mt-5"><Link href="/app/plans">Review my plan <ArrowLeft size={13} /></Link></Button></Card>;
  const receiptByProcedure = new Map(calculation.receipts.map((receipt) => [receipt.procedureId, receipt]));
  const recommendedByProcedure = new Map(procedures.map((procedure) => [procedure.id, optimization?.optimized.schedule[procedure.id]]));
  return (
    <div className="space-y-6 pb-10">
      <div className="print-hidden flex flex-wrap items-center justify-between gap-3">
        <Link href="/app" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft size={13} /> Back to overview</Link>
        <Button onClick={() => window.print()}><FileDown size={14} /> Print / save as PDF</Button>
      </div>
      <header className="border-b border-border pb-6">
        <p className="eyebrow text-primary">PlanPilot summary</p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight">{plan.name}</h1>
        <p className="mt-2 text-xs text-muted-foreground">A private planning summary · generated {new Date().toLocaleDateString()}</p>
      </header>
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryMetric label="Insurance pays" value={money(calculation.totals.insurerPaymentCents)} />
        <SummaryMetric label="You pay" value={money(calculation.totals.patientPaymentCents)} />
        <SummaryMetric label="Benefits remaining" value={money(calculation.benefitsRemainingByYear[Object.keys(calculation.benefitsRemainingByYear)[0] ?? ""] ?? Math.max(0, plan.annualMaximumCents - plan.alreadyUsedMaximumCents))} />
      </div>
      {optimization && <Card className="border-primary/25 bg-secondary/25"><p className="text-xs font-medium">Schedule comparison</p><p className="mt-2 text-xs text-muted-foreground">Recommended schedule estimate: <strong className="text-foreground">{money(optimization.optimized.calculation?.totals.patientPaymentCents ?? calculation.totals.patientPaymentCents)}</strong>{optimization.savingsCents > 0 ? ` · potential savings ${money(optimization.savingsCents)}` : " · no lower-cost alternative found"}.</p></Card>}
      <section>
        <SectionHeading title="Confirmed plan rules" />
        <Card className="overflow-hidden p-0"><div className="grid divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">{[
          ["Annual maximum", money(plan.annualMaximumCents)],
          ["Already used", money(plan.alreadyUsedMaximumCents)],
          ["Deductible", money(plan.individualDeductibleCents)],
          ["Coverage", `Preventive ${plan.coverageByClass.preventive}% · Basic ${plan.coverageByClass.basic}% · Major ${plan.coverageByClass.major}%`],
          ["Benefit year starts", `${plan.benefitYearStartMonth}/${plan.benefitYearStartDay}`],
          ["Network rule", plan.networkRules?.outOfNetworkBalanceBilling ? "Out-of-network balance billing may apply" : "Balance billing not assumed"],
        ].map(([label, value]) => <div key={label} className="flex justify-between gap-4 px-5 py-3 text-xs"><span className="text-muted-foreground">{label}</span><span className="text-right tabular-nums">{value}</span></div>)}</div></Card>
      </section>
      <section>
        <SectionHeading title="Care and estimates" />
        <Card className="overflow-hidden p-0"><div className="hidden grid-cols-[minmax(0,1fr)_130px_130px_100px] gap-3 border-b border-border bg-muted/30 px-5 py-2 text-[9px] uppercase tracking-wider text-muted-foreground sm:grid"><span>Procedure</span><span>Current date</span><span>Recommended</span><span className="text-right">You pay</span></div><div className="divide-y divide-border">{procedures.map((procedure) => <SummaryProcedure key={procedure.id} procedure={procedure} currentDate={currentSchedule[procedure.id]} recommendedDate={recommendedByProcedure.get(procedure.id)} patientPayment={receiptByProcedure.get(procedure.id)?.patientPayment ?? 0} />)}</div></Card>
      </section>
      <p className="border-t border-border pt-4 text-[10px] leading-5 text-muted-foreground">Planning estimates only. Confirm coverage, network participation, allowed amounts, and treatment timing with your insurer and dentist. This summary is generated from your confirmed PlanPilot inputs.</p>
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) { return <Card className="p-4"><p className="text-[10px] text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-medium tabular-nums">{value}</p></Card>; }
function SectionHeading({ title }: { title: string }) { return <h2 className="mb-3 text-[10px] uppercase tracking-widest text-primary">{title}</h2>; }
function SummaryProcedure({ procedure, currentDate, recommendedDate, patientPayment }: { procedure: Procedure; currentDate?: string; recommendedDate?: string; patientPayment: number }) { return <div className="grid gap-2 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_130px_130px_100px] sm:items-center sm:gap-3"><div><p className="text-xs font-medium">{procedure.name}</p><p className="mt-1 text-[10px] text-muted-foreground">{procedure.serviceClass} · {procedure.networkStatus}</p></div><p className="text-[11px] text-muted-foreground sm:text-foreground">Current: {date(currentDate)}</p><p className="text-[11px] text-muted-foreground sm:text-foreground">Recommended: {date(recommendedDate)}</p><p className="text-sm font-medium tabular-nums sm:text-right">{money(patientPayment)}</p></div>; }
