import { describe, expect, it } from "vitest";
import { calculateClaims } from "@/lib/insurance/claims";
import { planRuleViolations } from "@/lib/insurance/coverage-rules";
import { lookupReferenceCost } from "@/lib/insurance/reference-costs";
import { optimizeSchedule } from "@/lib/optimization/optimizer";
import { devFixture } from "./fixtures/dev-fixture";

describe("plan waiting periods and frequency limits", () => {
  it("does not pay a claim before its waiting period ends", () => {
    const plan = { ...devFixture.plan, waitingPeriods: [{ serviceClass: "basic" as const, eligibleFrom: "2026-12-01" }] };
    const procedure = devFixture.procedures[1];
    const result = calculateClaims({ plan, procedures: [procedure], schedule: { [procedure.id]: "2026-10-20" } });
    expect(result.receipts[0].finalInsurerPayment).toBe(0);
    expect(result.warnings.some((warning) => warning.includes("waiting period"))).toBe(true);
  });

  it("blocks the second use inside a frequency window", () => {
    const first = devFixture.procedures[1];
    const second = { ...first, id: "10000000-0000-4000-8000-000000000015", name: "Second filling", earliestDate: "2026-11-20" };
    const plan = { ...devFixture.plan, frequencyLimits: [{ serviceClass: "basic" as const, maxUses: 1, periodMonths: 12, usedDates: [] }] };
    const result = calculateClaims({ plan, procedures: [first, second], schedule: { [first.id]: "2026-10-20", [second.id]: "2026-11-20" } });
    expect(result.receipts[0].finalInsurerPayment).toBeGreaterThan(0);
    expect(result.receipts[1].finalInsurerPayment).toBe(0);
    expect(planRuleViolations(plan, [first, second], { [first.id]: "2026-10-20", [second.id]: "2026-11-20" })).toHaveLength(1);
  });

  it("gives the optimizer an eligible date after a waiting period", () => {
    const procedure = { ...devFixture.procedures[1], earliestDate: "2026-10-20", dentistApprovedLatestDate: "2027-01-15" };
    const plan = { ...devFixture.plan, waitingPeriods: [{ serviceClass: "basic" as const, eligibleFrom: "2026-12-01" }] };
    const result = optimizeSchedule(plan, [procedure], { [procedure.id]: "2026-10-20" });
    expect(result.optimized.feasibility.feasible).toBe(true);
    expect(result.optimized.schedule[procedure.id] >= "2026-12-01").toBe(true);
    expect(result.reasons.some((reason) => reason.includes("Waiting periods"))).toBe(true);
  });
});

describe("reference cost fallback", () => {
  it("returns a labeled in-network estimate for a common CDT code", () => {
    const estimate = lookupReferenceCost("d2740", "in-network");
    expect(estimate?.source).toBe("reference-benchmark");
    expect(estimate?.allowedFeeCents).toBeLessThan(estimate?.billedFeeCents ?? 0);
  });

  it("returns separate out-of-network benchmark amounts", () => {
    const inside = lookupReferenceCost("D2391", "in-network");
    const outside = lookupReferenceCost("D2391", "out-of-network");
    expect(outside?.billedFeeCents).toBeGreaterThan(inside?.billedFeeCents ?? 0);
    expect(outside?.allowedFeeCents).toBeGreaterThan(inside?.allowedFeeCents ?? 0);
  });
});
