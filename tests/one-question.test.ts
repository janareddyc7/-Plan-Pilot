import { describe, expect, it } from "vitest";
import { devFixture } from "@/lib/demo/dev-fixture";
import { selectOneSmartQuestion, withFieldValue } from "@/lib/optimization/one-question";
import { dentalPlanSchema } from "@/lib/schemas";

describe("One Smart Question", () => {
  it("selects a question from actual plan uncertainty and computes regret", () => {
    const question = selectOneSmartQuestion(
      devFixture.plan,
      devFixture.procedures,
      devFixture.originalSchedule,
    );
    expect(question?.field).toBe("annualMaximumCents");
    expect(question?.plausibleValues).toEqual([100000, 150000, 200000]);
    expect(question?.worstCaseRegretCents).toBeGreaterThanOrEqual(0);
  });

  it("changes nested coverage fields without weakening schema validation", () => {
    const plan = withFieldValue(devFixture.plan, "coverageByClass.major", 60);
    expect(plan.coverageByClass.major).toBe(60);
    expect(dentalPlanSchema.safeParse(plan).success).toBe(true);
  });
});

