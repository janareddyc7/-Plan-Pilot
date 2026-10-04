import type { DentalPlan, Procedure, Schedule } from "@/lib/schemas";
import { calculateClaims, type ClaimsCalculation } from "@/lib/insurance/claims";
import { enumerateSchedules } from "./enumerate";
import { evaluateSchedule, type FeasibilityResult } from "./feasibility";

export interface ScheduleCandidate { schedule: Schedule; feasibility: FeasibilityResult; calculation?: ClaimsCalculation }
export interface OptimizationResult { baseline: ScheduleCandidate; candidates: ScheduleCandidate[]; optimized: ScheduleCandidate; savingsCents: number; warnings: string[]; reasons: string[] }

export function optimizeSchedule(plan: DentalPlan, procedures: Procedure[], originalSchedule: Schedule): OptimizationResult {
  const baselineCalculation = calculateClaims({ plan, procedures, schedule: originalSchedule });
  const baseline: ScheduleCandidate = { schedule: originalSchedule, feasibility: evaluateSchedule(procedures, originalSchedule, plan), calculation: baselineCalculation };
  const candidates = enumerateSchedules(procedures, originalSchedule, 256, plan).map((schedule) => {
    const feasibility = evaluateSchedule(procedures, schedule, plan);
    return { schedule, feasibility, calculation: feasibility.feasible ? calculateClaims({ plan, procedures, schedule }) : undefined };
  });
  const feasible = candidates.filter((candidate) => candidate.feasibility.feasible && candidate.calculation);
  const optimized = feasible.sort((a, b) => (a.calculation!.totals.patientPaymentCents - b.calculation!.totals.patientPaymentCents) || JSON.stringify(a.schedule).localeCompare(JSON.stringify(b.schedule)))[0] ?? baseline;
  const optimizedCost = optimized.calculation?.totals.patientPaymentCents ?? baselineCalculation.totals.patientPaymentCents;
  const savingsCents = Math.max(0, baselineCalculation.totals.patientPaymentCents - optimizedCost);
  const reasons = explainOptimization(plan, procedures, originalSchedule, optimized, savingsCents, feasible.length);
  return { baseline, candidates, optimized, savingsCents, warnings: [...new Set([...(baselineCalculation.warnings), ...(optimized.calculation?.warnings ?? [])])], reasons };
}

function explainOptimization(
  plan: DentalPlan,
  procedures: Procedure[],
  originalSchedule: Schedule,
  optimized: ScheduleCandidate,
  savingsCents: number,
  checkedCount: number,
) {
  const reasons: string[] = [];
  if (!optimized.feasibility.feasible) {
    return ["No alternative passed the dentist-approved dates, dependencies, waiting periods, and frequency limits."];
  }
  const changed = procedures.filter((procedure) => originalSchedule[procedure.id] !== optimized.schedule[procedure.id]);
  if (!changed.length) reasons.push("Your current dates are already the lowest-cost feasible schedule checked.");
  for (const procedure of changed) {
    const from = originalSchedule[procedure.id];
    const to = optimized.schedule[procedure.id];
    if (from && to && from.slice(0, 4) !== to.slice(0, 4)) {
      reasons.push(`${procedure.name} moves to a new benefit year so a fresh annual maximum can be considered.`);
    } else {
      reasons.push(`${procedure.name} moves from ${from ?? "the original date"} to ${to} within the approved timing window.`);
    }
  }
  if (savingsCents > 0) reasons.push(`The selected dates lower estimated patient responsibility while preserving the plan rules.`);
  if (plan.waitingPeriods?.length) reasons.push("Waiting periods were enforced before a schedule could be recommended.");
  if (plan.frequencyLimits?.length) reasons.push("Frequency limits were enforced before a schedule could be recommended.");
  reasons.push(`${Math.max(1, checkedCount)} feasible date combination${checkedCount === 1 ? "" : "s"} checked.`);
  return reasons;
}
