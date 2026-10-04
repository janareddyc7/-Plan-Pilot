import { describe, expect, it } from "vitest";
import { compareNetworkQuotes } from "@/lib/insurance/compare-network";
import { devFixture } from "./fixtures/dev-fixture";

describe("network quote comparison", () => {
  it("uses the same claims waterfall for both quotes", () => {
    const procedure = devFixture.procedures[1];
    const comparison = compareNetworkQuotes({
      plan: { ...devFixture.plan, alreadyUsedDeductibleCents: devFixture.plan.individualDeductibleCents },
      procedures: [procedure],
      schedule: devFixture.originalSchedule,
      procedureId: procedure.id,
      inNetwork: { billedFeeCents: 20000, allowedFeeCents: 15000 },
      outOfNetwork: { billedFeeCents: 20000, allowedFeeCents: 18000 },
    });
    expect(comparison.inNetwork.receipt.patientPayment + comparison.inNetwork.receipt.finalInsurerPayment + comparison.inNetwork.receipt.networkWriteOff).toBe(20000);
    expect(comparison.outOfNetwork.receipt.patientPayment + comparison.outOfNetwork.receipt.finalInsurerPayment).toBe(20000);
    expect(comparison.patientDifferenceCents).toBe(comparison.outOfNetwork.totals.patientPaymentCents - comparison.inNetwork.totals.patientPaymentCents);
  });
  it("honors the confirmed no-balance-billing rule", () => {
    const procedure = devFixture.procedures[1];
    const result = compareNetworkQuotes({
      plan: { ...devFixture.plan, networkRules: { outOfNetworkBalanceBilling: false, allowedAmountPolicy: "explicit" } },
      procedures: [procedure], schedule: devFixture.originalSchedule, procedureId: procedure.id,
      inNetwork: { billedFeeCents: 20000, allowedFeeCents: 15000 },
      outOfNetwork: { billedFeeCents: 20000, allowedFeeCents: 15000 },
    });
    expect(result.outOfNetwork.receipt.outOfNetworkGap).toBe(0);
    expect(result.outOfNetwork.receipt.networkWriteOff).toBe(5000);
  });
});
