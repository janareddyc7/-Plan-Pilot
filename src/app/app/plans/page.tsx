"use client";
import { useState } from "react";
import { PlanUpload } from "@/components/insurance/plan-upload";
import { PlanExtractionReview } from "@/components/ai/plan-extraction-review";
import { PlanEditor } from "@/components/insurance/plan-editor";
import { ProcedureEditor } from "@/components/simulator/procedure-editor";
import { ProcedureCreateForm } from "@/components/simulator/procedure-create-form";
import { useSimulatorStore } from "@/store/simulator-store";
import type { AiExtractionResult, DentalPlan } from "@/lib/schemas";
import { FileCheck2, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
export default function Page() {
  return <PlanPage />;
}
function PlanPage() {
  const plan = useSimulatorStore((state) => state.plan);
  const procedures = useSimulatorStore((state) => state.procedures);
  const ready = useSimulatorStore((state) => state.ready);
  const updatePlan = useSimulatorStore((state) => state.updatePlan);
  const [extraction, setExtraction] = useState<AiExtractionResult>();
  const [documentId, setDocumentId] = useState<string>();
  const [manualNote, setManualNote] = useState<string>();
  const [savedPlan, setSavedPlan] = useState(false);

  if (!ready) {
    return <div className="py-12 text-sm text-muted-foreground">Loading your plan workspace…</div>;
  }

  function confirmExtraction(candidate: AiExtractionResult, sourceDocumentId: string) {
    const data = candidate.extractedPlanData;
    const provenance = { ...plan.fieldProvenance };
    const aliases: Record<string, string> = {
      annualMaximum: "annualMaximumCents",
      alreadyUsedMaximum: "alreadyUsedMaximumCents",
      individualDeductible: "individualDeductibleCents",
      alreadyUsedDeductible: "alreadyUsedDeductibleCents",
    };
    for (const field of candidate.fields) {
      if (field.source) provenance[aliases[field.field] ?? field.field] = field.source;
    }
    const changes: Partial<DentalPlan> = {
      isConfirmed: true,
      sourceDocumentId,
      fieldProvenance: provenance,
    };
    if (data.name !== undefined) changes.name = data.name;
    if (data.annualMaximumCents !== undefined) changes.annualMaximumCents = data.annualMaximumCents;
    if (data.alreadyUsedMaximumCents !== undefined) changes.alreadyUsedMaximumCents = data.alreadyUsedMaximumCents;
    if (data.individualDeductibleCents !== undefined) changes.individualDeductibleCents = data.individualDeductibleCents;
    if (data.alreadyUsedDeductibleCents !== undefined) changes.alreadyUsedDeductibleCents = data.alreadyUsedDeductibleCents;
    if (data.coverageByClass) changes.coverageByClass = { ...plan.coverageByClass, ...data.coverageByClass };
    if (data.deductibleAppliesTo) changes.deductibleAppliesTo = data.deductibleAppliesTo;
    if (data.networkRules)
      changes.networkRules = {
        outOfNetworkBalanceBilling: plan.networkRules?.outOfNetworkBalanceBilling ?? true,
        allowedAmountPolicy: plan.networkRules?.allowedAmountPolicy ?? "explicit",
        ...data.networkRules,
      };
    if (data.waitingPeriods) changes.waitingPeriods = data.waitingPeriods;
    if (data.benefitYearStartMonth !== undefined) changes.benefitYearStartMonth = data.benefitYearStartMonth;
    if (data.benefitYearStartDay !== undefined) changes.benefitYearStartDay = data.benefitYearStartDay;
    if (data.preventiveCountsTowardMax !== undefined) changes.preventiveCountsTowardMax = data.preventiveCountsTowardMax;
    updatePlan(changes);
    setExtraction(undefined);
    setDocumentId(undefined);
    setManualNote("Plan fields confirmed. Review the calculation assumptions before relying on an estimate.");
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="eyebrow text-primary">Plan & care</p>
          <h1 className="mt-3 font-serif text-4xl tracking-tight">Make the inputs trustworthy.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            Upload your benefits summary or enter the rules manually. Every estimate stays tied to the values you confirm here.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileCheck2 size={15} className="text-primary" />
          {plan.isConfirmed ? "Inputs confirmed" : "Waiting for confirmation"}
        </div>
      </div>
      <Card className="flex gap-3 bg-secondary/30 p-4">
        <Info size={16} className="mt-0.5 shrink-0 text-primary" />
        <p className="text-xs leading-6 text-muted-foreground">
          Use the insurer’s benefit summary for coverage, deductible, annual maximum, and renewal details. Estimates are planning aids; confirm final coverage with your insurer and timing with your dentist.
        </p>
      </Card>
      <PlanUpload
        onExtraction={(candidate, id) => {
          setExtraction(candidate);
          setDocumentId(id);
          setManualNote(undefined);
        }}
        onManualFallback={setManualNote}
      />
      {extraction && documentId && (
        <PlanExtractionReview
          extraction={extraction}
          documentId={documentId}
          onConfirm={confirmExtraction}
        />
      )}
      {manualNote && !extraction && (
        <p className="border border-border bg-muted/50 p-3 text-xs text-muted-foreground" role="status">
          {manualNote}
        </p>
      )}
      <PlanEditor key={`${plan.id}-${plan.isConfirmed}-${plan.sourceDocumentId ?? "manual"}`} plan={plan} onSaved={() => setSavedPlan(true)} />
      <div>
        <p className="mb-3 text-[10px] uppercase tracking-widest text-muted-foreground">Care to model</p>
        {procedures.length === 0 && (
          <Card className="mb-4 border-dashed bg-transparent p-5">
            <p className="text-sm font-medium">Add your planned procedures next.</p>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              Procedure editing is available after you save a plan. Add the billed estimate, allowed amount, timing window, and any prerequisite care so the optimizer can compare real options.
            </p>
          </Card>
        )}
        <div className="grid gap-4 lg:grid-cols-2">
          {procedures.map((procedure) => <ProcedureEditor key={procedure.id} procedure={procedure} planId={plan.id} />)}
        </div>
        <div className="mt-4">
          <ProcedureCreateForm planId={plan.id} enabled={savedPlan || Boolean(plan.userId)} />
        </div>
      </div>
    </div>
  );
}
