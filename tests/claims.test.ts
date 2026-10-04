import { describe, expect, it } from "vitest";
import { calculateClaims } from "@/lib/insurance/claims";
import { devFixture } from "./fixtures/dev-fixture";

describe("claims engine", () => {
  it("includes the deductible in patient responsibility", () => {
    const result = calculateClaims({
      plan: devFixture.plan,
      procedures: [devFixture.procedures[1]],
      schedule: devFixture.originalSchedule,
    });
    expect(result.receipts[0].deductibleApplied).toBe(5000);
    expect(result.receipts[0].finalInsurerPayment).toBe(12000);
    expect(result.receipts[0].patientPayment).toBe(8000);
    expect(result.receipts[0].annualMaxCapReduction).toBe(0);
  });
  it("pays preventive benefits that are exempt from the annual maximum", () => {
    const result = calculateClaims({
      plan: {
        ...devFixture.plan,
        preventiveCountsTowardMax: false,
        alreadyUsedMaximumCents: 150000,
      },
      procedures: [devFixture.procedures[0]],
      schedule: devFixture.originalSchedule,
    });
    expect(result.receipts[0].finalInsurerPayment).toBe(15000);
    expect(result.receipts[0].patientPayment).toBe(0);
    expect(result.receipts[0].annualMaximumRemainingAfter).toBe(0);
  });
  it("reports the reduction caused by an exhausted maximum", () => {
    const result = calculateClaims({
      plan: { ...devFixture.plan, alreadyUsedMaximumCents: 149000 },
      procedures: [devFixture.procedures[1]],
      schedule: devFixture.originalSchedule,
    });
    expect(result.receipts[0].finalInsurerPayment).toBe(1000);
    expect(result.receipts[0].annualMaxCapReduction).toBe(11000);
    expect(result.receipts[0].patientPayment).toBe(19000);
  });

  it("attributes non-coverage to confirmed rules instead of a manual override", () => {
    const result = calculateClaims({
      plan: {
        ...devFixture.plan,
        waitingPeriods: [{ serviceClass: "basic", eligibleFrom: "2027-01-01" }],
      },
      procedures: [devFixture.procedures[1]],
      schedule: devFixture.originalSchedule,
    });
    expect(result.receipts[0].finalInsurerPayment).toBe(0);
    expect(result.receipts[0].assumptions).toContain(
      "This procedure is not covered at the selected date under the confirmed plan rules.",
    );
    expect(result.receipts[0].assumptions.join(" ")).not.toContain("override");
  });
  it("calculates deterministic integer-cent receipts", () => {
    const result = calculateClaims({
      plan: devFixture.plan,
      procedures: devFixture.procedures,
      schedule: devFixture.originalSchedule,
    });
    expect(result.receipts).toHaveLength(3);
    expect(
      result.receipts.every((receipt) =>
        Number.isInteger(receipt.patientPayment),
      ),
    ).toBe(true);
    expect(result.totals.patientPaymentCents).toBeGreaterThan(0);
  });

  it("preserves the money invariant for every receipt", () => {
    const result = calculateClaims({
      plan: devFixture.plan,
      procedures: devFixture.procedures,
      schedule: devFixture.originalSchedule,
    });
    for (const receipt of result.receipts) {
      expect(
        receipt.patientPayment +
          receipt.finalInsurerPayment +
          receipt.networkWriteOff,
      ).toBe(receipt.billedFee);
      expect(receipt.annualMaximumRemainingAfter).toBeLessThanOrEqual(
        receipt.annualMaximumRemainingBefore,
      );
    }
  });

  it("resets deductible and maximum at a new benefit year", () => {
    const nextYear = {
      ...devFixture.procedures[2],
      id: "10000000-0000-4000-8000-000000000014",
      earliestDate: "2027-02-01",
    };
    const result = calculateClaims({
      plan: devFixture.plan,
      procedures: [devFixture.procedures[1], nextYear],
      schedule: {
        [devFixture.procedures[1].id]: "2026-12-01",
        [nextYear.id]: "2027-02-01",
      },
    });
    expect(result.receipts[1].benefitYear).toBe("2027-01-01");
    expect(result.receipts[1].annualMaximumRemainingBefore).toBe(
      devFixture.plan.annualMaximumCents,
    );
  });
});
