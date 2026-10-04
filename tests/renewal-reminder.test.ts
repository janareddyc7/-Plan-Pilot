import { describe, expect, it } from "vitest";
import { renewalReminder } from "@/lib/insurance/renewal-reminder";
import { devFixture } from "./fixtures/dev-fixture";

describe("renewal reminder", () => {
  it("appears only near renewal when confirmed benefits remain", () => {
    const plan = { ...devFixture.plan, benefitYearStartMonth: 1, benefitYearStartDay: 1, isConfirmed: true };
    expect(renewalReminder(plan, 50000, new Date("2026-12-15T12:00:00Z"))?.daysLeft).toBe(17);
    expect(renewalReminder(plan, 50000, new Date("2026-10-01T12:00:00Z"))).toBeUndefined();
    expect(renewalReminder(plan, 0, new Date("2026-12-15T12:00:00Z"))).toBeUndefined();
  });
});
