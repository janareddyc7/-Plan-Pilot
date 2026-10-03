# PlanPilot implementation checklist

This checklist is the working delivery sequence for the dashboard and full product. Keep the order unless a dependency requires a documented change.

## Phase 1 — Claims engine

- [ ] Add `src/lib/insurance/rounding.ts`
- [ ] Add `src/lib/insurance/benefit-year.ts`
- [ ] Add `src/lib/insurance/network.ts`
- [ ] Add `src/lib/insurance/claims.ts`
- [ ] Implement integer-cent calculations
- [ ] Implement deductible handling
- [ ] Implement preventive/basic/major coverage
- [ ] Implement in-network write-offs
- [ ] Implement out-of-network balance billing
- [ ] Implement annual maximum tracking
- [ ] Implement benefit-year resets
- [ ] Return complete `ClaimReceipt` objects
- [ ] Add warnings for uncertain or unsupported rules
- [ ] Add `tests/claims.test.ts`
- [ ] Verify golden cases and money invariants

## Phase 2 — Typed Dev scenario

- [ ] Add `src/lib/demo/dev-fixture.ts`
- [ ] Add `tests/dev-fixture.test.ts`
- [ ] Define Dev’s plan and procedures completely
- [ ] Define allowed fees, classifications, dates, deductible balance, and annual maximum usage
- [ ] Define next-year and preventive assumptions explicitly
- [ ] Document any difference from the proposal’s reference totals
- [ ] Ensure no savings amount is hardcoded in the UI

## Phase 3 — Schedule evaluator and optimizer

- [ ] Add `src/lib/optimization/feasibility.ts`
- [ ] Add `src/lib/optimization/enumerate.ts`
- [ ] Add `src/lib/optimization/optimizer.ts`
- [ ] Add `src/lib/optimization/one-question.ts`
- [ ] Add `tests/optimizer.test.ts`
- [ ] Add `tests/one-question.test.ts`
- [ ] Validate earliest/latest approved dates
- [ ] Protect fixed and urgent procedures
- [ ] Validate dependency ordering and waiting periods
- [ ] Enumerate bounded schedule candidates
- [ ] Add deterministic tie-breaking
- [ ] Return evaluated-state and constraint traces
- [ ] Calculate decision regret for unknown plan fields

## Phase 4 — Simulator state

- [ ] Add `src/store/simulator-store.ts`
- [ ] Keep `originalSchedule`, `currentSchedule`, and `optimizedSchedule` separate
- [ ] Add selectors for receipts, totals, savings, benefits remaining, and warnings
- [ ] Recalculate when plan, procedure, fee, network, or date changes
- [ ] Persist only guest drafts and interface preferences locally

## Phase 5 — First dashboard

- [ ] Add `src/components/simulator/procedure-timeline.tsx`
- [ ] Add `src/components/simulator/procedure-card.tsx`
- [ ] Add `src/components/simulator/cost-comparison.tsx`
- [ ] Add `src/components/simulator/scenario-controls.tsx`
- [ ] Add `src/components/insurance/benefits-progress.tsx`
- [ ] Display original out-of-pocket
- [ ] Display optimized out-of-pocket
- [ ] Display potential savings from engine output
- [ ] Display remaining benefits
- [ ] Display original and optimized timelines
- [ ] Add procedure cards and optimize action
- [ ] Add assumptions and warnings
- [ ] Verify desktop and mobile layouts

## Phase 6 — Receipt inspector

- [ ] Add `src/components/receipts/receipt-drawer.tsx`
- [ ] Add `src/components/receipts/receipt-line-item.tsx`
- [ ] Make every money amount clickable
- [ ] Show billed, allowed, adjustments, deductible, covered base, coverage, annual maximum, insurer payment, and patient payment
- [ ] Show provenance, assumptions, and source references
- [ ] Resolve every displayed number from a receipt field

## Phase 7 — Plan and procedure editing

- [ ] Add `src/components/insurance/plan-editor.tsx`
- [ ] Add `src/components/simulator/procedure-editor.tsx`
- [ ] Edit annual maximum, deductible, coverage, renewal date, fees, network, urgency, dates, and dependencies
- [ ] Recalculate immediately after valid edits
- [ ] Show validation errors and block estimates when required fields are unconfirmed

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
