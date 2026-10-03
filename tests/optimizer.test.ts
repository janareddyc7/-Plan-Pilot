import { describe, expect, it } from "vitest";
import { devFixture } from "@/lib/demo/dev-fixture";
import { evaluateSchedule } from "@/lib/optimization/feasibility";
import { optimizeSchedule } from "@/lib/optimization/optimizer";

describe("schedule optimizer", () => {
  it("protects dependencies and chooses a deterministic feasible candidate", () => {
    const result = optimizeSchedule(devFixture.plan, devFixture.procedures, devFixture.originalSchedule);
    expect(result.optimized.feasibility.feasible).toBe(true);
    expect(result.optimized.schedule[devFixture.procedures[2].id] >= result.optimized.schedule[devFixture.procedures[1].id]).toBe(true);
  });
  it("explains blocked dependency moves", () => {
    const schedule = { ...devFixture.originalSchedule, [devFixture.procedures[2].id]: "2026-10-01" };
    const result = evaluateSchedule(devFixture.procedures, schedule);
    expect(result.feasible).toBe(false);
    expect(result.reasonCodes).toContain("dependency");
  });
});
