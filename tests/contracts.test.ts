import { describe, it, expect } from "vitest";
import {
  centsSchema,
  dentalPlanSchema,
  procedureSchema,
  aiExtractionResultSchema,
  financialExplanationSchema,
} from "@/lib/schemas";
import { safeNext } from "@/lib/auth/redirect";
const id = "00000000-0000-4000-8000-000000000001";
const plan = {
  id,
  name: "Synthetic contract fixture",
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
  preventiveCountsTowardMax: true,
  isConfirmed: false,
  fieldProvenance: {},
  unknownFields: [],
};
describe("financial input boundaries", () => {
  it("accepts nonnegative integer cents only", () => {
    expect(centsSchema.parse(15000)).toBe(15000);
    for (const v of [-1, 1.5, Infinity, Number.MAX_SAFE_INTEGER + 1])
      expect(centsSchema.safeParse(v).success).toBe(false);
  });
  it("validates plan usage, percentage and renewal dates", () => {
    expect(dentalPlanSchema.safeParse(plan).success).toBe(true);
    for (const changes of [
      { benefitYearStartMonth: 2, benefitYearStartDay: 30 },
      { alreadyUsedMaximumCents: 160000 },
      { coverageByClass: { preventive: 100, basic: 101, major: 50 } },
    ])
      expect(dentalPlanSchema.safeParse({ ...plan, ...changes }).success).toBe(
        false,
      );
  });
  it("rejects contradictory procedure dates and self-dependencies", () => {
    const p = {
      id,
      name: "Filling",
      serviceClass: "basic",
      estimatedBilledFeeCents: 15000,
      networkStatus: "in-network",
      earliestDate: "2026-10-03",
      dentistApprovedLatestDate: "2026-12-01",
      urgent: false,
      isFlexible: true,
      requiresProcedureIds: [],
      notes: "Synthetic",
    };
    expect(procedureSchema.safeParse(p).success).toBe(true);
    expect(
      procedureSchema.safeParse({ ...p, fixedDate: "2027-01-01" }).success,
    ).toBe(false);
    expect(
      procedureSchema.safeParse({ ...p, requiresProcedureIds: [id] }).success,
    ).toBe(false);
  });
  it("does not let extraction pre-confirm a plan or prose invent numbers", () => {
    expect(
      aiExtractionResultSchema.safeParse({
        extractedPlanData: {},
        fields: [],
        unresolvedItems: [],
        isConfirmed: true,
      }).success,
    ).toBe(false);
    expect(
      financialExplanationSchema.safeParse({
        lines: [
          {
            template: "patient-responsibility",
            receiptId: id,
            field: "patientPayment",
            text: "You owe $5",
          },
        ],
      }).success,
    ).toBe(false);
  });
});
describe("redirect protection", () => {
  it("accepts local destinations and rejects external redirects", () => {
    expect(safeNext("/reset-password")).toBe("/reset-password");
    for (const url of [
      "https://evil.test",
      "//evil.test",
      "/\\evil.test",
      "/\n/evil.test",
    ])
      expect(safeNext(url)).toBe("/app");
  });
});
