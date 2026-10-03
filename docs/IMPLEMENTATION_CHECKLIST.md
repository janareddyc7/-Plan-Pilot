# PlanPilot implementation checklist

This checklist is the working delivery sequence for the dashboard and full product. Keep the order unless a dependency requires a documented change.

## Phase 1 — Claims engine ✅

- [x] Add `src/lib/insurance/rounding.ts`
- [x] Add `src/lib/insurance/benefit-year.ts`
- [x] Add `src/lib/insurance/network.ts`
- [x] Add `src/lib/insurance/claims.ts`
- [x] Implement integer-cent calculations
- [x] Implement deductible handling
- [x] Implement preventive/basic/major coverage
- [x] Implement in-network write-offs
- [x] Implement out-of-network balance billing
- [x] Implement annual maximum tracking
- [x] Implement benefit-year resets
- [x] Return complete `ClaimReceipt` objects
- [x] Add warnings for uncertain or unsupported rules
- [x] Add `tests/claims.test.ts`
- [x] Verify golden cases and money invariants

## Phase 2 — Typed Dev scenario ✅

- [x] Add `src/lib/demo/dev-fixture.ts`
- [x] Add `tests/dev-fixture.test.ts`
- [x] Define Dev’s plan and procedures completely
- [x] Define allowed fees, classifications, dates, deductible balance, and annual maximum usage
- [x] Define next-year and preventive assumptions explicitly
- [x] Document any difference from the proposal’s reference totals
- [x] Ensure no savings amount is hardcoded in the UI

## Phase 3 — Schedule evaluator and optimizer (core complete)

- [x] Add `src/lib/optimization/feasibility.ts`
- [x] Add `src/lib/optimization/enumerate.ts`
- [x] Add `src/lib/optimization/optimizer.ts`
- [ ] Add `src/lib/optimization/one-question.ts`
- [x] Add `tests/optimizer.test.ts`
- [ ] Add `tests/one-question.test.ts`
- [x] Validate earliest/latest approved dates
- [x] Protect fixed and urgent procedures
- [x] Validate dependency ordering and waiting periods
- [x] Enumerate bounded schedule candidates
- [x] Add deterministic tie-breaking
- [x] Return evaluated-state and constraint traces
- [ ] Calculate decision regret for unknown plan fields

## Phase 4 — Simulator state ✅

- [x] Add `src/store/simulator-store.ts`
- [x] Keep `originalSchedule`, `currentSchedule`, and `optimizedSchedule` separate
- [x] Add selectors for receipts, totals, savings, benefits remaining, and warnings
- [x] Recalculate when plan, procedure, fee, network, or date changes
- [x] Persist only guest drafts and interface preferences locally

## Phase 5 — First dashboard (core complete)

- [x] Add `src/components/simulator/procedure-timeline.tsx`
- [x] Add `src/components/simulator/procedure-card.tsx`
- [x] Add `src/components/simulator/cost-comparison.tsx`
- [ ] Add `src/components/simulator/scenario-controls.tsx`
- [x] Add `src/components/insurance/benefits-progress.tsx`
- [x] Display original out-of-pocket
- [x] Display optimized out-of-pocket
- [x] Display potential savings from engine output
- [x] Display remaining benefits
- [x] Display original and optimized cost comparison
- [x] Add procedure cards and optimize action
- [x] Add assumptions and warnings
- [x] Verify responsive layout via build and responsive classes

## Phase 6 — Receipt inspector (core complete)

- [x] Add `src/components/receipts/receipt-drawer.tsx`
- [ ] Add `src/components/receipts/receipt-line-item.tsx`
- [x] Make procedure patient amounts clickable
- [x] Show billed, allowed, adjustments, deductible, covered base, coverage, annual maximum, insurer payment, and patient payment
- [x] Show provenance, assumptions, and source references
- [x] Resolve displayed receipt numbers from receipt fields

## Phase 7 — Plan and procedure editing ✅

- [x] Add `src/components/insurance/plan-editor.tsx`
- [x] Add `src/components/simulator/procedure-editor.tsx`
- [x] Edit annual maximum, deductible, coverage, procedure fees, allowed fees, network, and names
- [x] Recalculate immediately after valid edits
- [x] Show validation errors and block estimates when required fields are invalid
- [x] Edit renewal date, urgency, dependencies, and dentist-approved timing windows

## Phase 8 — Upload and AI extraction

- [ ] Add `src/components/insurance/plan-upload.tsx`
- [ ] Add `src/components/ai/plan-extraction-review.tsx`
- [ ] Add `src/lib/documents/pdf-text.ts`
- [ ] Add `src/lib/ai/extract.ts`
- [ ] Add `src/app/api/documents/upload/route.ts`
- [ ] Implement private Supabase Storage upload
- [ ] Extract text from text-based PDFs
- [ ] Fall back to manual entry for scanned PDFs
- [ ] Return structured candidate fields with confidence, quotes, and pages
- [ ] Require user confirmation before calculations
- [ ] Keep AI arithmetic disabled

## Phase 9 — One Smart Question and explanations

- [ ] Add `src/components/ai/one-smart-question.tsx`
- [ ] Add `src/components/ai/ai-explanation.tsx`
- [ ] Add `src/lib/ai/explain.ts`
- [ ] Implement `src/app/api/ai/explain/route.ts`
- [ ] Prioritize questions using sensitivity and regret
- [ ] Use receipt-reference explanation templates
- [ ] Reject unsupported monetary claims

## Phase 10 — Supabase persistence

- [ ] Implement authenticated plan CRUD
- [ ] Implement procedure CRUD
- [ ] Implement scenario save and restore
- [ ] Implement private document metadata
- [ ] Validate every request with Zod
- [ ] Verify owner identity in every server route
- [ ] Test cross-user RLS isolation
- [ ] Keep guest demo independent of Supabase

## Phase 11 — Final quality pass

- [ ] Run `npm run theme:check`
- [ ] Run `npm run typecheck`
- [ ] Run `npm run lint`
- [ ] Run `npm run test`
- [ ] Run `npm run build`
- [ ] Test signup, email confirmation, sign-in, sign-out, and recovery
- [ ] Test Dev demo and plan/procedure edits
- [ ] Test schedule changes and receipt inspection
- [ ] Test upload fallback
- [ ] Test Supabase save/restore and RLS isolation
- [ ] Test desktop, mobile, keyboard access, and reduced motion

## Definition of done

The dashboard is ready when the guest Dev scenario works without credentials, all displayed financial values come from the deterministic engine, schedule changes recalculate receipts, blocked moves explain why, uploads require confirmation, persistence is owner-scoped, and all project checks pass.
