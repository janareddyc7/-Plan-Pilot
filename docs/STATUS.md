# Current implementation

The user expanded the original scaffold milestone to the synthetic simulator and dashboard.

Implemented:
- Shared schemas, Supabase auth, email callbacks, guarded routes, migrations.
- Synthetic Dev plan, claims calculation, bounded candidate schedule comparison.
- Date editing with feasibility errors, current/recommended views, apply/reset.
- Procedure receipts in a keyboard-accessible modal.
- Compact Vintage Paper theme on home, auth and workspace.
- Phase 8 private PDF upload, selectable-text extraction, Gemini candidate fields,
  verified page quotes, and explicit plan confirmation before calculations.

Auth repair: the previous local dev process ran without outbound network access,
preventing Supabase session verification. Restarted with network permission and
verified the existing browser session redirects from /sign-in?next=%2Fapp to /app.
Password sign-in now checks the cookie session through /api/auth/session before
a full navigation. Removed the browser getSession redirect loop. This endpoint
returns 503 for Supabase connectivity errors rather than implying bad credentials.
Do not disable verification to work around an offline server.

Still incomplete:
- Phase 9 One Smart Question and receipt-referenced explanations.
- Account plan/procedure/scenario CRUD (API placeholders remain).
- Full optimizer search, uncertainty/regret analysis, comprehensive edge cases.
- Guest draft persistence and full plan/procedure editing.
- Aggregate financial amount inspection (procedure receipts are inspectable).
- New signup, confirmation email and password recovery delivery acceptance tests.

The signed-in dashboard currently uses the labeled synthetic sample; it does not
claim to load a user's saved insurance plan.

Verification this iteration: existing signed-in redirect in the in-app browser;
comparison and receipt open/Escape in Chrome; mobile dashboard/auth layout;
production compilation; tests for corrected deductible, cap and preventive
accounting; server-session response tests; Phase 8 extraction routes and
confirmation UI compile and lint. Live Gemini extraction still requires a key.
