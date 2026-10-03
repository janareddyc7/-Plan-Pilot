import { describe, expect, it } from "vitest";
import { calculateDevScenario, devFixture } from "@/lib/demo/dev-fixture";

describe("Dev fixture", () => {
  it("contains complete typed inputs and derives all totals", () => {
    const result = calculateDevScenario();
    expect(devFixture.plan.isConfirmed).toBe(true);
    expect(devFixture.procedures).toHaveLength(3);
    expect(result.totals.billedFeeCents).toBeGreaterThan(0);
    expect(result.totals.patientPaymentCents + result.totals.insurerPaymentCents + result.totals.networkWriteOffCents).toBeGreaterThan(0);
  });
});
