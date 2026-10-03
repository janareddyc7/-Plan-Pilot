import type { DentalPlan, Procedure, Schedule } from "@/lib/schemas";
import { calculateClaims, type ClaimsCalculation } from "@/lib/insurance/claims";
import { enumerateSchedules } from "./enumerate";
import { evaluateSchedule, type FeasibilityResult } from "./feasibility";

export interface ScheduleCandidate { schedule: Schedule; feasibility: FeasibilityResult; calculation?: ClaimsCalculation }
export interface OptimizationResult { baseline: ScheduleCandidate; candidates: ScheduleCandidate[]; optimized: ScheduleCandidate; savingsCents: number; warnings: string[] }

export function optimizeSchedule(plan: DentalPlan, procedures: Procedure[], originalSchedule: Schedule): OptimizationResult {
  const baselineCalculation = calculateClaims({ plan, procedures, schedule: originalSchedule });
  const baseline: ScheduleCandidate = { schedule: originalSchedule, feasibility: evaluateSchedule(procedures, originalSchedule), calculation: baselineCalculation };
  const candidates = enumerateSchedules(procedures, originalSchedule).map((schedule) => {
    const feasibility = evaluateSchedule(procedures, schedule);
    return { schedule, feasibility, calculation: feasibility.feasible ? calculateClaims({ plan, procedures, schedule }) : undefined };
  });
  const feasible = candidates.filter((candidate) => candidate.feasibility.feasible && candidate.calculation);
  const optimized = feasible.sort((a, b) => (a.calculation!.totals.patientPaymentCents - b.calculation!.totals.patientPaymentCents) || JSON.stringify(a.schedule).localeCompare(JSON.stringify(b.schedule)))[0] ?? baseline;
  return { baseline, candidates, optimized, savingsCents: Math.max(0, baselineCalculation.totals.patientPaymentCents - (optimized.calculation?.totals.patientPaymentCents ?? baselineCalculation.totals.patientPaymentCents)), warnings: [...new Set([...(baselineCalculation.warnings), ...(optimized.calculation?.warnings ?? [])])] };
}
