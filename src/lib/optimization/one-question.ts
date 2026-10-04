import type { DentalPlan, Procedure, Schedule } from "@/lib/schemas";
import { dentalPlanSchema, smartQuestionSchema, type SmartQuestion } from "@/lib/schemas";
import { calculateClaims } from "@/lib/insurance/claims";
import { optimizeSchedule } from "./optimizer";

const fieldLabels: Record<string, { label: string; why: string }> = {
  annualMaximumCents: {
    label: "your plan's annual maximum",
    why: "It controls how much of the insurer contribution can remain available when care crosses a benefit-year boundary.",
  },
  individualDeductibleCents: {
    label: "your individual deductible",
    why: "It changes the first eligible dollars in the claim waterfall and can change which schedule is least expensive.",
  },
  "coverageByClass.major": {
    label: "your major-service coverage percentage",
    why: "It changes the plan contribution for crowns and other major services, which can change the recommended year.",
  },
  "coverageByClass.basic": {
    label: "your basic-service coverage percentage",
    why: "It changes the plan contribution for fillings and other basic services, which can change the schedule comparison.",
  },
};

export function selectOneSmartQuestion(
  plan: DentalPlan,
  procedures: Procedure[],
  schedule: Schedule,
): SmartQuestion | undefined {
  if (!plan.unknownFields.length) return undefined;
  const baseline = optimizeSchedule(plan, procedures, schedule);
  const baselineSchedule = baseline.optimized.schedule;
  const baselineCurrentCost = baseline.optimized.calculation?.totals.patientPaymentCents ??
    baseline.baseline.calculation?.totals.patientPaymentCents ?? 0;

  const candidates = plan.unknownFields.flatMap((unknown, index) => {
    const meta = fieldLabels[unknown.field];
    if (!meta || unknown.plausibleValues.length < 1) return [];
    const currentValue = getFieldValue(plan, unknown.field);
    if (currentValue === undefined) return [];

    let worstCaseRegretCents = 0;
    let sensitivityCents = 0;
    let recommendedScheduleChanges = false;
    for (const plausibleValue of unknown.plausibleValues) {
      const candidatePlan = withFieldValue(plan, unknown.field, plausibleValue);
      const parsed = dentalPlanSchema.safeParse(candidatePlan);
      if (!parsed.success) continue;
      const candidateOptimization = optimizeSchedule(parsed.data, procedures, schedule);
      const baselineDecisionCost = calculateClaims({
        plan: parsed.data,
        procedures,
        schedule: baselineSchedule,
      }).totals.patientPaymentCents;
      const bestCost = candidateOptimization.optimized.calculation?.totals.patientPaymentCents ?? baselineDecisionCost;
      worstCaseRegretCents = Math.max(worstCaseRegretCents, Math.max(0, baselineDecisionCost - bestCost));
      sensitivityCents = Math.max(sensitivityCents, Math.abs(baselineDecisionCost - baselineCurrentCost));
      if (JSON.stringify(candidateOptimization.optimized.schedule) !== JSON.stringify(baselineSchedule))
        recommendedScheduleChanges = true;
    }
    return [{
      field: unknown.field,
      question: `What is ${meta.label}?`,
      why: meta.why,
      plausibleValues: unknown.plausibleValues,
      currentValue,
      worstCaseRegretCents: unknown.worstCaseRegretCents ?? worstCaseRegretCents,
      sensitivityCents: unknown.sensitivityCents ?? sensitivityCents,
      recommendedScheduleChanges,
      index,
    }];
  });

  const selected = candidates.sort(
    (a, b) =>
      b.worstCaseRegretCents - a.worstCaseRegretCents ||
      b.sensitivityCents - a.sensitivityCents ||
      a.index - b.index,
  )[0];
  if (!selected) return undefined;
  return smartQuestionSchema.parse({
    field: selected.field,
    question: selected.question,
    why: selected.why,
    plausibleValues: selected.plausibleValues,
    currentValue: selected.currentValue,
    worstCaseRegretCents: selected.worstCaseRegretCents,
    sensitivityCents: selected.sensitivityCents,
    recommendedScheduleChanges: selected.recommendedScheduleChanges,
  });
}

function getFieldValue(plan: DentalPlan, field: string) {
  if (field === "coverageByClass.major") return plan.coverageByClass.major;
  if (field === "coverageByClass.basic") return plan.coverageByClass.basic;
  if (field in plan) return plan[field as keyof DentalPlan] as number;
  return undefined;
}

export function withFieldValue(plan: DentalPlan, field: string, value: number): DentalPlan {
  if (field === "coverageByClass.major")
    return { ...plan, coverageByClass: { ...plan.coverageByClass, major: value } };
  if (field === "coverageByClass.basic")
    return { ...plan, coverageByClass: { ...plan.coverageByClass, basic: value } };
  return { ...plan, [field]: value } as DentalPlan;
}

