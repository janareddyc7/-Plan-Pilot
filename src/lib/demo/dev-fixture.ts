import type { DentalPlan, Procedure, Schedule } from "@/lib/schemas";
import { calculateClaims, type ClaimsCalculation } from "@/lib/insurance/claims";

export const DEV_PLAN_ID = "10000000-0000-4000-8000-000000000001";
export const DEV_PROCEDURE_IDS = {
  exam: "10000000-0000-4000-8000-000000000011",
  filling: "10000000-0000-4000-8000-000000000012",
  crown: "10000000-0000-4000-8000-000000000013",
} as const;

/** Synthetic, confirmed inputs used by the guest demo. No result totals are stored here. */
export const devPlan: DentalPlan = {
  id: DEV_PLAN_ID,
  name: "Dev's PPO plan",
  planType: "PPO",
  benefitYearStartMonth: 1,
  benefitYearStartDay: 1,
  usageAsOfDate: "2026-10-03",
  annualMaximumCents: 150000,
  alreadyUsedMaximumCents: 26000,
  individualDeductibleCents: 5000,
  alreadyUsedDeductibleCents: 0,
  deductibleAppliesTo: { preventive: false, basic: true, major: true },
  coverageByClass: { preventive: 100, basic: 80, major: 50 },
  networkRules: { outOfNetworkBalanceBilling: true, allowedAmountPolicy: "explicit" },
  preventiveCountsTowardMax: true,
  isConfirmed: true,
  fieldProvenance: {},
  unknownFields: [],
};

export const devProcedures: Procedure[] = [
  { id: DEV_PROCEDURE_IDS.exam, name: "Periodic exam and cleaning", code: "D0120", serviceClass: "preventive", estimatedBilledFeeCents: 18000, estimatedAllowedFeeCents: 15000, networkStatus: "in-network", earliestDate: "2026-10-10", dentistApprovedLatestDate: "2026-12-15", urgent: false, isFlexible: true, requiresProcedureIds: [], serviceDatePolicy: "completion", notes: "Routine preventive visit." },
  { id: DEV_PROCEDURE_IDS.filling, name: "Composite filling", code: "D2391", serviceClass: "basic", estimatedBilledFeeCents: 24000, estimatedAllowedFeeCents: 20000, networkStatus: "in-network", earliestDate: "2026-10-20", dentistApprovedLatestDate: "2026-12-15", urgent: false, isFlexible: true, requiresProcedureIds: [], serviceDatePolicy: "completion", notes: "One-surface filling." },
  { id: DEV_PROCEDURE_IDS.crown, name: "Porcelain crown", code: "D2740", serviceClass: "major", estimatedBilledFeeCents: 120000, estimatedAllowedFeeCents: 90000, networkStatus: "in-network", earliestDate: "2026-11-05", dentistApprovedLatestDate: "2027-01-15", urgent: false, isFlexible: true, requiresProcedureIds: [DEV_PROCEDURE_IDS.filling], serviceDatePolicy: "seat", notes: "Crown after restorative work." },
];

export const devOriginalSchedule: Schedule = {
  [DEV_PROCEDURE_IDS.exam]: "2026-10-10",
  [DEV_PROCEDURE_IDS.filling]: "2026-10-20",
  [DEV_PROCEDURE_IDS.crown]: "2026-11-05",
};

export const devFixture = { plan: devPlan, procedures: devProcedures, originalSchedule: devOriginalSchedule } as const;

export function calculateDevScenario(schedule: Schedule = devOriginalSchedule): ClaimsCalculation {
  return calculateClaims({ plan: devPlan, procedures: devProcedures, schedule });
}
