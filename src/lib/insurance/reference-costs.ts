import type { Procedure } from "@/lib/schemas";

export interface ReferenceCostEstimate {
  code: string;
  name: string;
  serviceClass: Procedure["serviceClass"];
  inNetwork: { billedFeeCents: number; allowedFeeCents: number };
  outOfNetwork: { billedFeeCents: number; allowedFeeCents: number };
  source: "reference-benchmark";
  basis: string;
}

/**
 * A small, transparent fallback benchmark for common CDT services. These are
 * planning estimates, not carrier rates or a live FAIR Health feed. Keeping
 * the values in one typed table means the UI can offer a usable starting point
 * without ever disguising a benchmark as a dentist quote.
 */
const REFERENCE_COSTS: ReferenceCostEstimate[] = [
  {
    code: "D0120",
    name: "Periodic oral evaluation",
    serviceClass: "preventive",
    inNetwork: { billedFeeCents: 11000, allowedFeeCents: 8500 },
    outOfNetwork: { billedFeeCents: 13500, allowedFeeCents: 9500 },
    source: "reference-benchmark",
    basis: "Illustrative 2026 national benchmark; verify against your dentist and plan.",
  },
  {
    code: "D1110",
    name: "Adult prophylaxis (cleaning)",
    serviceClass: "preventive",
    inNetwork: { billedFeeCents: 13500, allowedFeeCents: 10500 },
    outOfNetwork: { billedFeeCents: 17500, allowedFeeCents: 12000 },
    source: "reference-benchmark",
    basis: "Illustrative 2026 national benchmark; verify against your dentist and plan.",
  },
  {
    code: "D2391",
    name: "One-surface composite filling",
    serviceClass: "basic",
    inNetwork: { billedFeeCents: 22000, allowedFeeCents: 17500 },
    outOfNetwork: { billedFeeCents: 28500, allowedFeeCents: 19000 },
    source: "reference-benchmark",
    basis: "Illustrative 2026 national benchmark; verify against your dentist and plan.",
  },
  {
    code: "D2740",
    name: "Porcelain/ceramic crown",
    serviceClass: "major",
    inNetwork: { billedFeeCents: 125000, allowedFeeCents: 95000 },
    outOfNetwork: { billedFeeCents: 165000, allowedFeeCents: 110000 },
    source: "reference-benchmark",
    basis: "Illustrative 2026 national benchmark; verify against your dentist and plan.",
  },
  {
    code: "D2950",
    name: "Core buildup",
    serviceClass: "major",
    inNetwork: { billedFeeCents: 45000, allowedFeeCents: 35000 },
    outOfNetwork: { billedFeeCents: 60000, allowedFeeCents: 40000 },
    source: "reference-benchmark",
    basis: "Illustrative 2026 national benchmark; verify against your dentist and plan.",
  },
  {
    code: "D3310",
    name: "Anterior root canal",
    serviceClass: "major",
    inNetwork: { billedFeeCents: 95000, allowedFeeCents: 75000 },
    outOfNetwork: { billedFeeCents: 125000, allowedFeeCents: 85000 },
    source: "reference-benchmark",
    basis: "Illustrative 2026 national benchmark; verify against your dentist and plan.",
  },
  {
    code: "D7210",
    name: "Surgical tooth removal",
    serviceClass: "basic",
    inNetwork: { billedFeeCents: 55000, allowedFeeCents: 42000 },
    outOfNetwork: { billedFeeCents: 75000, allowedFeeCents: 48000 },
    source: "reference-benchmark",
    basis: "Illustrative 2026 national benchmark; verify against your dentist and plan.",
  },
];

export function lookupReferenceCost(code: string | undefined, networkStatus: Procedure["networkStatus"] = "in-network") {
  const normalized = code?.trim().toUpperCase();
  if (!normalized) return undefined;
  const estimate = REFERENCE_COSTS.find((item) => item.code === normalized);
  if (!estimate) return undefined;
  const quote = networkStatus === "in-network" ? estimate.inNetwork : estimate.outOfNetwork;
  return { ...estimate, ...quote };
}

export function listReferenceCosts() {
  return REFERENCE_COSTS.map((item) => ({ ...item }));
}
