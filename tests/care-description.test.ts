import { describe, expect, it } from "vitest";
import { statedMoneyToCents } from "@/lib/schemas/care-description";

describe("care description money normalization", () => {
  it("accepts only explicit currency amounts", () => {
    expect(statedMoneyToCents("$1,250.50")).toBe(125050);
    expect(statedMoneyToCents("75")).toBe(7500);
    expect(statedMoneyToCents("about $75")).toBeUndefined();
    expect(statedMoneyToCents("1,2,3")).toBeUndefined();
  });
});
