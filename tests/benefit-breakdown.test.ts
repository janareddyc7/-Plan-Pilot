import { describe, expect, it } from "vitest";
import { summarizeBenefitsByType } from "@/lib/insurance/benefit-breakdown";
import { calculateDevScenario, devPlan, devProcedures } from "./fixtures/dev-fixture";

describe("benefit type breakdown", () => {
  it("groups modeled receipts by service class while preserving plan percentages", () => {
    const calculation = calculateDevScenario();
    const result = summarizeBenefitsByType(devPlan, devProcedures, calculation.receipts);
    expect(result).toEqual([
      expect.objectContaining({ serviceClass: "preventive", procedureCount: 1, coveragePercent: 100 }),
      expect.objectContaining({ serviceClass: "basic", procedureCount: 1, coveragePercent: 80 }),
      expect.objectContaining({ serviceClass: "major", procedureCount: 1, coveragePercent: 50 }),
    ]);
    expect(result.reduce((sum, item) => sum + item.insurerPaymentCents, 0)).toBe(calculation.totals.insurerPaymentCents);
    expect(result.reduce((sum, item) => sum + item.patientPaymentCents, 0)).toBe(calculation.totals.patientPaymentCents);
  });
});
