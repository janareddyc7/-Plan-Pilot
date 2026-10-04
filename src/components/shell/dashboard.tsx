"use client";
import { useState } from "react";
import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw, CalendarDays, Check, FileUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { benefitYearForDate } from "@/lib/insurance/benefit-year";
import { calculateClaims } from "@/lib/insurance/claims";
import { useSimulatorStore } from "@/store/simulator-store";
import { ProcedureTimeline } from "@/components/simulator/procedure-timeline";
import { CostComparison } from "@/components/simulator/cost-comparison";
import { ReceiptDrawer } from "@/components/receipts/receipt-drawer";
import type { ClaimReceipt } from "@/lib/schemas";
import { OneSmartQuestion } from "@/components/ai/one-smart-question";
import { AiExplanation } from "@/components/ai/ai-explanation";
import { selectOneSmartQuestion, withFieldValue } from "@/lib/optimization/one-question";
import { createScenarioSnapshot } from "@/lib/scenarios/snapshot";

const money = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
export function Dashboard() {
  const {
    plan,
    procedures,
    currentSchedule,
    calculation,
    optimization,
    setDate,
    optimize,
    reset,
    applyOptimized,
    validationError,
    updatePlan,
    ready,
    hasPlan,
  } = useSimulatorStore();
  const [selectedReceipt, setSelectedReceipt] = useState<ClaimReceipt>();
  const [view, setView] = useState<"current" | "recommended">("current");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string>();
  const recommended =
    view === "recommended" && optimization?.optimized.calculation;
  const displayed = recommended || calculation;
  const schedule = recommended
    ? optimization!.optimized.schedule
    : currentSchedule;
  const year = benefitYearForDate(plan.usageAsOfDate, plan);
  const remaining =
    displayed.benefitsRemainingByYear[year] ??
    plan.annualMaximumCents - plan.alreadyUsedMaximumCents;
  const used = plan.annualMaximumCents - remaining;
  const baseline = calculateClaims({
    plan,
    procedures,
    schedule: useSimulatorStore.getState().originalSchedule,
  });
  const smartQuestion = useMemo(
    () => selectOneSmartQuestion(plan, procedures, currentSchedule),
    [plan, procedures, currentSchedule],
  );
  if (!ready) {
    return (
      <div className="grid min-h-[55vh] place-items-center">
        <div className="text-center">
          <div className="mx-auto mb-4 size-8 animate-pulse rounded-full bg-primary/20" />
          <p className="text-sm font-medium">Preparing your workspace</p>
          <p className="mt-2 text-xs text-muted-foreground">Loading your saved plan and care details.</p>
        </div>
      </div>
    );
  }
  if (!hasPlan) return <WorkspaceStart />;
  async function saveScenario() {
    setSaving(true);
    setSaveMessage(undefined);
    try {
      const planResponse = await fetch("/api/plans", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const planPayload = (await planResponse.json()) as { error?: { message?: string } };
      if (!planResponse.ok) throw new Error(planPayload.error?.message ?? "Save the plan before saving a scenario.");
      const scenario = createScenarioSnapshot({
        id: crypto.randomUUID(),
        plan,
        procedures,
        originalSchedule: useSimulatorStore.getState().originalSchedule,
        currentSchedule: schedule,
        optimizedSchedule: optimization?.optimized.schedule,
        calculation: displayed,
        potentialSavingsCents: optimization?.savingsCents,
      });
      const response = await fetch("/api/scenarios", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: `${plan.name} · ${new Date().toLocaleDateString()}`, scenario }),
      });
      const payload = (await response.json()) as { error?: { message?: string } };
      if (!response.ok) throw new Error(payload.error?.message ?? "Scenario could not be saved.");
      setSaveMessage("Scenario saved. You can restore it from Saved scenarios.");
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "Scenario could not be saved.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            {plan.name}
          </div>
          <h1 className="font-serif text-3xl tracking-tight">
            Your benefits, in view.
          </h1>
          <p className="mt-2 text-xs text-muted-foreground">
            A considered plan for the care ahead.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={saveScenario} disabled={saving || procedures.length === 0} title={procedures.length === 0 ? "Add care details before saving a scenario." : undefined}>
            {saving ? "Saving…" : "Save snapshot"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              reset();
              setView("current");
            }}
          >
            <RotateCcw size={13} />
            Reset
          </Button>
          <Button
            onClick={() => {
              optimize();
              setView("recommended");
            }}
          >
            Compare schedules <ArrowRight size={13} />
          </Button>
        </div>
      </div>
      {saveMessage && <p role="status" className="text-xs text-primary">{saveMessage}</p>}
      {procedures.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <Metric
            label="Original estimate"
            value={money(baseline.totals.patientPaymentCents)}
            detail="Starting schedule"
          />
          <Metric
            label={recommended ? "Recommended estimate" : "Current estimate"}
            value={money(displayed.totals.patientPaymentCents)}
            detail="Your out-of-pocket cost"
          />
          <Metric
            label="Plan contribution"
            value={money(displayed.totals.insurerPaymentCents)}
            detail="Estimated insurance payment"
          />
          <Metric
            label="Benefits remaining"
            value={money(remaining)}
            detail={`Benefit year · ${year.slice(0, 4)}`}
          />
        </div>
      ) : (
        <Card className="flex flex-wrap items-center justify-between gap-4 border-dashed bg-transparent p-5">
          <div>
            <p className="text-sm font-medium">Your plan is ready for care details.</p>
            <p className="mt-1 text-xs leading-6 text-muted-foreground">Add the procedures you are considering to unlock real estimates and schedule comparisons.</p>
          </div>
          <Button asChild variant="outline"><Link href="/app/plans">Add care details <ArrowRight size={14} /></Link></Button>
        </Card>
      )}
      {validationError && (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive"
        >
          {validationError}
        </p>
      )}
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 space-y-4">
          <div className="flex items-center justify-between border-b border-border">
            <div className="flex gap-5">
              {(["current", "recommended"] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setView(item)}
                  disabled={item === "recommended" && !optimization}
                  className={`border-b-2 py-3 text-xs disabled:opacity-40 ${view === item ? "border-primary font-medium" : "border-transparent text-muted-foreground"}`}
                >
                  {item === "current" ? "Current schedule" : "Recommended"}
                </button>
              ))}
            </div>
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <CalendarDays size={12} />
              {year.slice(0, 4)}–{Number(year.slice(0, 4)) + 1}
            </span>
          </div>
          {recommended && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-secondary/40 px-4 py-3">
              <p className="text-xs">
                {optimization!.savingsCents
                  ? `Potential savings: ${money(optimization!.savingsCents)}`
                  : "No lower-cost alternative found in the schedules checked."}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  applyOptimized();
                  setView("current");
                }}
              >
                <Check size={13} />
                Use these dates
              </Button>
            </div>
          )}
          <ProcedureTimeline
            procedures={procedures}
            schedule={schedule}
            receipts={displayed.receipts}
            onDate={(id, date) => {
              setView("current");
              setDate(id, date);
            }}
            onInspect={setSelectedReceipt}
          />
          <CostComparison optimization={optimization} />
        </div>
        <div className="space-y-4">
          <OneSmartQuestion
            question={smartQuestion}
            onAnswer={(value) => {
              if (!smartQuestion) return;
              const candidate = withFieldValue(plan, smartQuestion.field, value);
              updatePlan({
                ...candidate,
                unknownFields: plan.unknownFields.filter(
                  (field) => field.field !== smartQuestion.field,
                ),
                isConfirmed: true,
              });
            }}
          />
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-medium">Annual benefits</h2>
              <span className="text-[10px] text-muted-foreground">
                {year.slice(0, 4)}
              </span>
            </div>
            <p className="mt-5 font-serif text-3xl">{money(remaining)}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              remaining of {money(plan.annualMaximumCents)}
            </p>
            <div
              role="progressbar"
              aria-label="Annual benefits used"
              aria-valuemin={0}
              aria-valuemax={plan.annualMaximumCents}
              aria-valuenow={used}
              className="mt-5 h-1.5 overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full bg-primary"
                style={{
                  width: `${Math.min(100, (used / plan.annualMaximumCents) * 100)}%`,
                }}
              />
            </div>
            <div className="mt-3 flex justify-between text-[10px] text-muted-foreground">
              <span>{money(used)} used</span>
              <span>Renews {renewalLabel(plan.benefitYearStartMonth, plan.benefitYearStartDay)}</span>
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="text-xs font-medium">Where the cost goes</h2>
            <div className="mt-4 space-y-3">
              <Row
                label="Billed fees"
                value={money(displayed.totals.billedFeeCents)}
              />
              <Row
                label="Network adjustment"
                value={`− ${money(displayed.totals.networkWriteOffCents)}`}
              />
              <Row
                label="Plan contribution"
                value={`− ${money(displayed.totals.insurerPaymentCents)}`}
              />
              <div className="border-t border-border pt-3">
                <Row
                  label="Your share"
                  value={money(displayed.totals.patientPaymentCents)}
                />
              </div>
            </div>
          </Card>
          <AiExplanation receipts={displayed.receipts} />
          <div className="px-1 text-[11px] leading-6 text-muted-foreground">
            <p className="font-medium text-foreground">Your calculation</p>
            <p>
              Every amount here is recalculated from your saved plan, care details, and selected dates.
            </p>
            {displayed.warnings.map((warning) => (
              <p key={warning} className="mt-2">
                {warning}
              </p>
            ))}
          </div>
        </div>
      </div>
      <ReceiptDrawer
        receipt={selectedReceipt}
        onClose={() => setSelectedReceipt(undefined)}
      />
    </div>
  );
}

function WorkspaceStart() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8 lg:py-16">
      <div className="max-w-2xl">
        <p className="eyebrow text-primary">Your workspace</p>
        <h1 className="mt-4 font-serif text-4xl leading-tight tracking-tight md:text-5xl">
          Start with the plan you actually have.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
          Add your benefit summary or enter the rules manually. PlanPilot will only calculate once your inputs are confirmed.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-primary">
            <FileUp size={18} />
          </div>
          <h2 className="mt-5 font-serif text-2xl">Upload your summary</h2>
          <p className="mt-2 text-xs leading-6 text-muted-foreground">
            Upload a text-based PDF from your insurer. We’ll show the extracted fields and page references for you to confirm.
          </p>
          <Button asChild className="mt-5">
            <Link href="/app/plans">Add a plan <ArrowRight size={14} /></Link>
          </Button>
        </Card>
        <Card className="p-6">
          <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-primary">
            <Sparkles size={18} />
          </div>
          <h2 className="mt-5 font-serif text-2xl">Use the guided setup</h2>
          <p className="mt-2 text-xs leading-6 text-muted-foreground">
            Enter the annual maximum, deductible, coverage, and renewal date. You can save the plan when it matches your benefits.
          </p>
          <Button asChild variant="outline" className="mt-5">
            <Link href="/app/plans">Open plan setup <ArrowRight size={14} /></Link>
          </Button>
        </Card>
      </div>
      <p className="text-xs text-muted-foreground">
        Need help? The <Link className="text-primary underline underline-offset-4" href="/app/settings">Guide & settings</Link> page explains the workflow and what each estimate means.
      </p>
    </div>
  );
}

function renewalLabel(month: number, day: number) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
    new Date(Date.UTC(2001, month - 1, day)),
  );
}
function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card className="px-4 py-4">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-medium tracking-tight tabular-nums">
        {value}
      </p>
      <p className="mt-2 text-[10px] text-muted-foreground">{detail}</p>
    </Card>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-[11px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
