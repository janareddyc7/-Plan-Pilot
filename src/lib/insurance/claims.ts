import {
  claimReceiptSchema,
  type ClaimReceipt,
  type DentalPlan,
  type Procedure,
  type Schedule,
} from "@/lib/schemas";
import { benefitYearForDate } from "./benefit-year";
import { resolveNetworkAmounts } from "./network";
import { percentageOfCents, sumCents } from "./rounding";
import {
  frequencyViolationForProcedure,
  frequencyRuleMatches,
} from "./coverage-rules";

export interface ClaimsCalculation {
  receipts: ClaimReceipt[];
  totals: {
    billedFeeCents: number;
    insurerPaymentCents: number;
    patientPaymentCents: number;
    networkWriteOffCents: number;
  };
  benefitsRemainingByYear: Record<string, number>;
  warnings: string[];
}

export interface ClaimsInput {
  plan: DentalPlan;
  procedures: Procedure[];
  schedule: Schedule;
}

const moneyFields = [
  "billedFee",
  "allowedAmount",
  "networkWriteOff",
  "outOfNetworkGap",
  "deductibleRemainingBefore",
  "deductibleApplied",
  "deductibleRemainingAfter",
  "coveredBase",
  "tentativeInsurerPayment",
  "annualMaximumRemainingBefore",
  "annualMaxCapReduction",
  "finalInsurerPayment",
  "patientPayment",
  "annualMaximumRemainingAfter",
] as const;

function source(note: string) {
  return { source: "assumption" as const, note };
}

export function calculateClaims({
  plan,
  procedures,
  schedule,
}: ClaimsInput): ClaimsCalculation {
  const state = new Map<
    string,
    { deductibleRemaining: number; annualMaximumRemaining: number }
  >();
  const warnings: string[] = [];
  const receipts: ClaimReceipt[] = [];
  const priorDatesByFrequencyRule = new Map<number, string[]>();
  for (const [index, rule] of (plan.frequencyLimits ?? []).entries()) {
    priorDatesByFrequencyRule.set(index, [...rule.usedDates]);
  }
  const ordered = procedures
    .map((procedure) => ({
      procedure,
      date:
        schedule[procedure.id] ?? procedure.fixedDate ?? procedure.earliestDate,
    }))
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        a.procedure.id.localeCompare(b.procedure.id),
    );
  for (const { procedure, date } of ordered) {
    const year = benefitYearForDate(date, plan);
    if (!state.has(year))
      state.set(year, {
        deductibleRemaining:
          year === benefitYearForDate(plan.usageAsOfDate, plan)
            ? Math.max(
                0,
                plan.individualDeductibleCents -
                  plan.alreadyUsedDeductibleCents,
              )
            : plan.individualDeductibleCents,
        annualMaximumRemaining:
          year === benefitYearForDate(plan.usageAsOfDate, plan)
            ? Math.max(
                0,
                plan.annualMaximumCents - plan.alreadyUsedMaximumCents,
              )
            : plan.annualMaximumCents,
      });
    const yearState = state.get(year)!;
    const network = resolveNetworkAmounts(
      procedure,
      plan.networkRules?.outOfNetworkBalanceBilling ?? true,
    );
    warnings.push(
      ...network.warnings.map((warning) => `${procedure.name}: ${warning}`),
    );
    let coveragePercent = plan.coverageByClass[procedure.serviceClass];
    let covered = true;
    if (procedure.planRuleOverrides?.coveragePercent !== undefined)
      coveragePercent = procedure.planRuleOverrides.coveragePercent;
    if (procedure.planRuleOverrides?.covered !== undefined)
      covered = procedure.planRuleOverrides.covered;
    const waitingPeriod = plan.waitingPeriods?.find(
      (rule) => rule.serviceClass === procedure.serviceClass,
    );
    if (waitingPeriod && date < waitingPeriod.eligibleFrom) {
      covered = false;
      warnings.push(
        `${procedure.name}: service date is before the ${procedure.serviceClass} waiting period ends (${waitingPeriod.eligibleFrom}).`,
      );
    }
    const frequencyViolations = frequencyViolationForProcedure(
      plan,
      procedure,
      date,
      priorDatesByFrequencyRule,
    );
    if (frequencyViolations.length) {
      covered = false;
      warnings.push(...frequencyViolations);
    }
    const deductibleApplies =
      procedure.planRuleOverrides?.deductibleApplies ??
      plan.deductibleAppliesTo[procedure.serviceClass];
    const deductibleBefore = yearState.deductibleRemaining;
    const deductibleApplied =
      covered && deductibleApplies
        ? Math.min(deductibleBefore, network.allowedAmount)
        : 0;
    yearState.deductibleRemaining -= deductibleApplied;
    const coveredBase = covered
      ? Math.max(0, network.allowedAmount - deductibleApplied)
      : 0;
    const tentative = covered
      ? percentageOfCents(coveredBase, coveragePercent)
      : 0;
    const maxBefore = yearState.annualMaximumRemaining;
    const countsTowardMax =
      procedure.serviceClass !== "preventive" || plan.preventiveCountsTowardMax;
    const finalPayment = countsTowardMax
      ? Math.min(maxBefore, tentative)
      : tentative;
    const capReduction = tentative - finalPayment;
    yearState.annualMaximumRemaining -= countsTowardMax ? finalPayment : 0;
    // The patient's total includes the deductible; never subtract it twice.
    const patientPayment = Math.max(
      0,
      network.billedFee - network.networkWriteOff - finalPayment,
    );
    const values = {
      billedFee: network.billedFee,
      allowedAmount: network.allowedAmount,
      networkWriteOff: network.networkWriteOff,
      outOfNetworkGap: network.outOfNetworkGap,
      deductibleRemainingBefore: deductibleBefore,
      deductibleApplied,
      deductibleRemainingAfter: yearState.deductibleRemaining,
      coveredBase,
      tentativeInsurerPayment: tentative,
      annualMaximumRemainingBefore: maxBefore,
      annualMaxCapReduction: capReduction,
      finalInsurerPayment: finalPayment,
      patientPayment,
      annualMaximumRemainingAfter: yearState.annualMaximumRemaining,
    };
    const receipt = claimReceiptSchema.parse({
      id: crypto.randomUUID(),
      procedureId: procedure.id,
      date,
      benefitYear: year,
      ...values,
      coveragePercent,
      figureIds: Object.fromEntries(
        moneyFields.map((field) => [field, `${procedure.id}:${field}`]),
      ),
      provenance: Object.fromEntries(
        moneyFields.map((field) => [
          field,
          source("Deterministic claims engine"),
        ]),
      ),
      assumptions: [
        ...network.warnings,
        ...(procedure.costSource === "reference-benchmark"
          ? [
              "Fees use a reference benchmark because a dentist quote was not supplied; verify the actual billed and allowed amounts.",
            ]
          : []),
        ...(covered
          ? []
          : [
              "This procedure is not covered at the selected date under the confirmed plan rules.",
            ]),
      ],
    });
    receipts.push(receipt);
    if (covered) {
      for (const [index, rule] of (plan.frequencyLimits ?? []).entries()) {
        if (!frequencyRuleMatches(rule, procedure)) continue;
        const dates = priorDatesByFrequencyRule.get(index) ?? [];
        dates.push(date);
        priorDatesByFrequencyRule.set(index, dates);
      }
    }
  }
  const totals = {
    billedFeeCents: sumCents(...receipts.map((r) => r.billedFee)),
    insurerPaymentCents: sumCents(
      ...receipts.map((r) => r.finalInsurerPayment),
    ),
    patientPaymentCents: sumCents(...receipts.map((r) => r.patientPayment)),
    networkWriteOffCents: sumCents(...receipts.map((r) => r.networkWriteOff)),
  };
  return {
    receipts,
    totals,
    benefitsRemainingByYear: Object.fromEntries(
      [...state].map(([year, value]) => [year, value.annualMaximumRemaining]),
    ),
    warnings: [...new Set(warnings)],
  };
}

export const calculateClaimReceipts = calculateClaims;
