import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const fixtureDirectory = resolve(process.cwd(), "test-data", "benefits");
const fixtures = [
  "01_synthetic_ppo_complete.pdf",
  "02_synthetic_ppo_ambiguous.pdf",
  "03_synthetic_network_edge_cases.pdf",
];

describe("PDF upload fixtures", () => {
  it("keeps every synthetic document available for upload testing", () => {
    for (const filename of fixtures) {
      const path = resolve(fixtureDirectory, filename);
      expect(existsSync(path)).toBe(true);
      expect(statSync(path).size).toBeGreaterThan(500);
      expect(readFileSync(path, "latin1")).toContain("SYNTHETIC TEST DOCUMENT");
    }
  });
});
