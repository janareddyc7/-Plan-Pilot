"use client";
import { useState } from "react";
import { PlanUpload } from "@/components/insurance/plan-upload";
import { PlanExtractionReview } from "@/components/ai/plan-extraction-review";
import { PlanEditor } from "@/components/insurance/plan-editor";
import { ProcedureEditor } from "@/components/simulator/procedure-editor";
import { useSimulatorStore } from "@/store/simulator-store";
import type { AiExtractionResult, DentalPlan } from "@/lib/schemas";
export default function Page() {
  return <PlanPage />;
}
function PlanPage() {
  const plan = useSimulatorStore((state) => state.plan);
  const procedures = useSimulatorStore((state) => state.procedures);
  const updatePlan = useSimulatorStore((state) => state.updatePlan);
  const [extraction, setExtraction] = useState<AiExtractionResult>();
  const [documentId, setDocumentId] = useState<string>();
  const [manualNote, setManualNote] = useState<string>();

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
    <div className="space-y-5">
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
      <PlanEditor plan={plan} />
      <div>
        <p className="mb-3 text-[10px] uppercase tracking-widest text-muted-foreground">Recommended care</p>
        <div className="grid gap-4 lg:grid-cols-2">
          {procedures.map((procedure) => <ProcedureEditor key={procedure.id} procedure={procedure} />)}
        </div>
      </div>
    </div>
  );
}
