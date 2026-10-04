# Current implementation

The authenticated workspace loads only owner-scoped Supabase data. The synthetic
simulator remains available only as an explicitly labeled public preview at `/demo`.

Implemented:
- Shared schemas, Supabase auth, email callbacks, guarded routes, migrations.
- Synthetic Dev plan, claims calculation, bounded candidate schedule comparison.
- Date editing with feasibility errors, current/recommended views, apply/reset.
- Procedure receipts in a keyboard-accessible modal.
- Compact Vintage Paper theme on home, auth and workspace.
- Phase 8 private PDF upload, selectable-text extraction, Gemini candidate fields,
  verified page quotes, and explicit plan confirmation before calculations.
- Phase 9 deterministic value-of-information question selection and typed,
  receipt-referenced Gemini explanations with engine-only fallback wording.
- Phase 10 owner-scoped plan, procedure, scenario and document metadata APIs,
  plus save/restore controls in the authenticated workspace.

Auth repair: the previous local dev process ran without outbound network access,
preventing Supabase session verification. Restarted with network permission and
verified the existing browser session redirects from /sign-in?next=%2Fapp to /app.
Password sign-in now checks the cookie session through /api/auth/session before
a full navigation. Removed the browser getSession redirect loop. This endpoint
returns 503 for Supabase connectivity errors rather than implying bad credentials.
Do not disable verification to work around an offline server.

Still incomplete:
- Live two-account RLS/storage isolation acceptance test.
- Full optimizer search, uncertainty/regret analysis, comprehensive edge cases.
- Guest draft persistence and adding brand-new procedures from an empty plan.
- Aggregate financial amount inspection (procedure receipts are inspectable).
- New signup, confirmation email and password recovery delivery acceptance tests.

When an account has no saved plan, the dashboard shows a guided setup state with
no financial metrics. Once a plan is saved, the dashboard loads that plan and its
owner-scoped procedures from Supabase.

Verification this iteration: existing signed-in redirect in the in-app browser;
comparison and receipt open/Escape in Chrome; mobile dashboard/auth layout;
production compilation; tests for corrected deductible, cap and preventive
accounting; server-session response tests; Phase 8 extraction routes and
confirmation UI; Phase 9/10 routes and persistence UI. The automated theme
check, typecheck, lint, 22-test suite, and production build all pass. Live
Supabase two-account isolation still requires two test accounts.
