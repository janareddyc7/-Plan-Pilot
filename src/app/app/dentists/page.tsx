"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, ArrowRightLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useSimulatorStore } from "@/store/simulator-store";
import { compareNetworkQuotes } from "@/lib/insurance/compare-network";
import { lookupReferenceCost } from "@/lib/insurance/reference-costs";

const money = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
const directory = "https://clients.go2dental.com/lfg/FindADentist";
function cents(value: string) { return /^\d+(?:\.\d{1,2})?$/.test(value.trim()) ? Math.round(Number(value) * 100) : undefined; }

export default function Page() {
  const { plan, procedures, currentSchedule, ready, hasPlan } = useSimulatorStore();
  const [procedureId, setProcedureId] = useState("");
  const [inside, setInside] = useState({ billed: "", allowed: "" });
  const [outside, setOutside] = useState({ billed: "", allowed: "" });
  const selectedId = procedures.some((item) => item.id === procedureId) ? procedureId : procedures[0]?.id;
  const selectedProcedure = procedures.find((item) => item.id === selectedId);
  const referenceInside = lookupReferenceCost(selectedProcedure?.code, "in-network");
  const referenceOutside = lookupReferenceCost(selectedProcedure?.code, "out-of-network");
  const valid = [inside.billed, inside.allowed, outside.billed, outside.allowed].every((value) => cents(value) !== undefined);
  const comparison = useMemo(() => {
    if (!ready || !hasPlan || !plan.isConfirmed || !selectedId || !valid) return undefined;
    try { return compareNetworkQuotes({ plan, procedures, schedule: currentSchedule, procedureId: selectedId, inNetwork: { billedFeeCents: cents(inside.billed)!, allowedFeeCents: cents(inside.allowed)! }, outOfNetwork: { billedFeeCents: cents(outside.billed)!, allowedFeeCents: cents(outside.allowed)! } }); } catch { return undefined; }
  }, [plan, procedures, currentSchedule, ready, hasPlan, selectedId, valid, inside, outside]);

  return <div className="mx-auto max-w-5xl space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow text-primary">Find care</p><h1 className="mt-2 text-3xl font-medium tracking-tight">Compare dentist quotes.</h1><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">See how in-network and out-of-network prices change your share under your confirmed plan.</p></div><a href={directory} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-xs font-medium text-primary hover:bg-muted">Open provider directory <ArrowUpRight size={13}/></a></div>
    <Card className="p-5"><div className="flex items-center gap-2 text-sm font-medium"><ArrowRightLeft size={16} className="text-primary"/> Compare real quotes</div><p className="mt-2 text-xs leading-6 text-muted-foreground">Get each dentist’s billed estimate and your insurer’s allowed amount for the same procedure. Network status and prices are not pulled from a live insurer feed; verify them before relying on this comparison.</p>
      {!ready ? <p className="mt-5 text-xs text-muted-foreground">Loading your plan…</p> : !hasPlan || !plan.isConfirmed ? <p className="mt-5 text-xs"><Link href="/app/plans" className="font-medium text-primary underline">Confirm your plan</Link> before comparing costs.</p> : procedures.length === 0 ? <p className="mt-5 text-xs"><Link href="/app/plans" className="font-medium text-primary underline">Add a procedure</Link> to your plan first.</p> : <div className="mt-5 space-y-5">
        <label className="block max-w-md text-xs font-medium">Procedure<select value={selectedId} onChange={(event) => setProcedureId(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-xs">{procedures.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        {referenceInside && referenceOutside && <div className="rounded-md border border-primary/20 bg-secondary/25 p-3 text-[11px] leading-5 text-muted-foreground"><p><span className="font-medium text-foreground">No quotes yet?</span> Use the labeled {selectedProcedure?.code} benchmark to compare both network scenarios, then replace it with actual dentist and insurer amounts.</p><button type="button" onClick={() => { setInside({ billed: (referenceInside.billedFeeCents / 100).toFixed(2), allowed: (referenceInside.allowedFeeCents / 100).toFixed(2) }); setOutside({ billed: (referenceOutside.billedFeeCents / 100).toFixed(2), allowed: (referenceOutside.allowedFeeCents / 100).toFixed(2) }); }} className="mt-2 inline-flex h-8 items-center rounded-md border border-border px-3 text-[11px] font-medium text-primary hover:bg-muted">Use reference benchmark for both</button></div>}
        <div className="grid gap-4 md:grid-cols-2"><QuoteFields title="In-network dentist" quote={inside} setQuote={setInside}/><QuoteFields title="Out-of-network dentist" quote={outside} setQuote={setOutside}/></div>
        {!valid && <p className="text-xs text-muted-foreground">Enter all four quote amounts to calculate a comparison.</p>}{valid && !comparison && <p role="alert" className="text-xs text-destructive">Check that each allowed amount is no greater than its billed fee.</p>}
      </div>}</Card>
    {comparison && <div className="grid gap-3 md:grid-cols-2"><Result title="In-network" result={comparison.inNetwork}/><Result title="Out-of-network" result={comparison.outOfNetwork}/><Card className="p-5 md:col-span-2"><p className="text-xs text-muted-foreground">Difference in your total planned care cost</p><p className="mt-2 text-2xl font-medium tabular-nums">{money(Math.abs(comparison.patientDifferenceCents))}</p><p className="mt-1 text-xs text-muted-foreground">{comparison.patientDifferenceCents > 0 ? "In-network quote estimates a lower patient cost." : comparison.patientDifferenceCents < 0 ? "Out-of-network quote estimates a lower patient cost." : "Both quotes estimate the same patient cost."} All other procedures stay on your current schedule.</p></Card></div>}
    <p className="text-xs leading-6 text-muted-foreground">Both quotes use your plan’s same class coverage percentage and deductible rules. Network-specific benefit percentages are not modeled. These are educational estimates, not final claims. Confirm the CDT code, network participation, allowed amount, balance billing, benefit rules, and predetermination with your insurer; confirm care timing with your dentist.</p>
  </div>;
}

function QuoteFields({ title, quote, setQuote }: { title: string; quote: { billed: string; allowed: string }; setQuote: (value: { billed: string; allowed: string }) => void }) {
  return <div className="rounded-lg border border-border bg-background p-4"><h2 className="text-sm font-medium">{title}</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-xs text-muted-foreground">Billed fee ($)<input inputMode="decimal" type="number" min="0" step="0.01" value={quote.billed} onChange={(event) => setQuote({ ...quote, billed: event.target.value })} placeholder="From dentist quote" className="mt-1"/></label><label className="text-xs text-muted-foreground">Allowed amount ($)<input inputMode="decimal" type="number" min="0" step="0.01" value={quote.allowed} onChange={(event) => setQuote({ ...quote, allowed: event.target.value })} placeholder="From insurer" className="mt-1"/></label></div></div>;
}
function Result({ title, result }: { title: string; result: ReturnType<typeof compareNetworkQuotes>["inNetwork"] }) {
  return <Card className="p-5"><p className="text-xs font-medium text-primary">{title}</p><div className="mt-4 grid grid-cols-2 gap-3"><div><p className="text-xs text-muted-foreground">Insurance pays</p><p className="mt-1 text-xl font-medium tabular-nums">{money(result.receipt.finalInsurerPayment)}</p></div><div><p className="text-xs text-muted-foreground">You pay</p><p className="mt-1 text-xl font-medium tabular-nums">{money(result.receipt.patientPayment)}</p></div></div><p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">All planned care: you pay {money(result.totals.patientPaymentCents)}</p>{result.warnings.map((warning) => <p key={warning} className="mt-2 text-[11px] text-muted-foreground">{warning}</p>)}</Card>;
}
