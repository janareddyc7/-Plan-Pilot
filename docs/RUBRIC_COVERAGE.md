# Rubric coverage map

This document maps the submission rubric to the implementation that can be inspected in the repository. It is intentionally honest about external-data limits.

| Requirement | Implementation | Evidence |
| --- | --- | --- |
| Complete plan inputs | `src/components/insurance/plan-editor.tsx` and `src/lib/schemas/plan.ts` | Annual maximum, used maximum, deductible, coverage by class, network billing policy, renewal date, waiting periods, and frequency limits are distinct validated fields. |
| Plain-language, itemized estimate | `src/lib/insurance/claims.ts`, `src/components/receipts/receipt-drawer.tsx` | The deterministic waterfall returns billed, allowed, write-off, deductible, coverage, annual-max cap, insurer, and patient amounts. |
| Multi-procedure timing | `src/lib/optimization/enumerate.ts`, `src/lib/optimization/feasibility.ts`, `src/lib/optimization/optimizer.ts` | Finite date search keeps dentist-approved windows, dependencies, urgent dates, waiting periods, and frequency limits intact. |
| Reference-cost fallback | `src/lib/insurance/reference-costs.ts`, `src/components/simulator/procedure-create-form.tsx` | Common CDT codes can populate a clearly labeled benchmark estimate when a quote is not available. This is an offline benchmark, not a live FAIR Health or carrier feed. |
| Known vs estimated | `src/lib/schemas/procedure.ts`, `src/lib/insurance/claims.ts`, UI copy | Dentist quotes and reference benchmarks have different provenance; receipts explain the benchmark assumption and the app keeps the verification disclaimer visible. |
| Annual maximum usage | `src/lib/insurance/claims.ts`, dashboard annual-benefits card | Remaining maximum is recalculated per benefit year after modeled care. |
| In/out-of-network comparison | `src/lib/insurance/compare-network.ts`, `/app/dentists` | Both scenarios use the same claims engine and explicit billed/allowed amounts. |
| Expiring benefits | `src/lib/insurance/renewal-reminder.ts`, dashboard | The workspace shows an in-app notice near renewal. It does not claim outbound email/SMS delivery. |
| AI boundary | `src/app/api/ai/chat/route.ts`, `src/lib/ai/extract.ts` | Gemini proposes or explains; it does not calculate money or decide clinical timing. |
| Arithmetic tests | `tests/claims.test.ts`, `tests/network-comparison.test.ts`, `tests/optimizer.test.ts`, `tests/coverage-rules.test.ts` | Deductible, maximum cap, years, network accounting, waiting periods, frequency limits, reference fallback, and optimizer behavior are covered. |
| Security | Supabase migrations, authenticated API routes, `.env.example` | Owner-scoped RLS and server-only Gemini credentials; no secrets or patient data are committed. |

## Known limits

The reference table is an offline benchmark for common CDT codes. It is intentionally not presented as a live insurer or FAIR Health lookup. Network participation, final allowed amounts, plan exclusions, and clinical appropriateness still require confirmation with the insurer and dentist.
