import type { DentalPlan, Procedure, Schedule, Scenario } from "@/lib/schemas";
import type { ClaimsCalculation } from "@/lib/insurance/claims";

export function createScenarioSnapshot({
  id,
  plan,
  procedures,
  originalSchedule,
  currentSchedule,
  optimizedSchedule,
  calculation,
  potentialSavingsCents,
}: {
  id: string;
  plan: DentalPlan;
  procedures: Procedure[];
  originalSchedule: Schedule;
  currentSchedule: Schedule;
  optimizedSchedule?: Schedule;
  calculation: ClaimsCalculation;
  potentialSavingsCents?: number;
}): Scenario {
  return {
    id,
    planSnapshot: plan,
    procedureSnapshots: procedures,
    originalSchedule,
    currentSchedule,
    optimizedSchedule,
    claimReceipts: calculation.receipts,
    summary: {
      patientPaymentCents: calculation.totals.patientPaymentCents,
      insurerPaymentCents: calculation.totals.insurerPaymentCents,
      billedFeeCents: calculation.totals.billedFeeCents,
      networkWriteOffCents: calculation.totals.networkWriteOffCents,
    },
    potentialSavingsCents,
    timestamp: new Date().toISOString(),
    provenance: Object.values(plan.fieldProvenance),
    validationWarnings: calculation.warnings,
  };
}

