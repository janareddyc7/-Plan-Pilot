# Current implementation

The authenticated workspace loads only owner-scoped Supabase data. There is no
public demo route or seeded production workspace; test fixtures live under tests.

Implemented:
- Shared schemas, Supabase auth, email callbacks, guarded routes, migrations.
- Deterministic claims calculation and bounded candidate schedule comparison.
- Date editing with feasibility errors, current/recommended views, apply/reset.
- Procedure receipts in a keyboard-accessible modal.
- Solar Dusk theme on home, auth and workspace.
- Phase 8 private PDF upload, selectable-text extraction, Gemini candidate fields,
  verified page quotes, and explicit plan confirmation before calculations.
- Phase 9 deterministic value-of-information question selection and typed,
  receipt-referenced Gemini explanations with engine-only fallback wording.
- Phase 10 owner-scoped plan, procedure, scenario and document metadata APIs,
  plus save/restore controls in the authenticated workspace.
- Dentist/clinic search with OpenStreetMap map preview and a direct link to
  Lincoln's official network directory. Network participation and availability
  are not inferred from public map data. Appointment requests happen by phone
  or the practice website; the app tracks planned/requested/confirmed visits in
  a new owner-scoped table. Migration 202610030002 was applied to the connected
  Supabase project on October 3, 2026; teammates must apply it to other projects.
- Authenticated AI benefits chat for general explanations and navigation.
  It receives a scoped read-only snapshot of the signed-in user's confirmed plan,
  procedures, and deterministic calculation summary; it never receives raw PDFs,
  storage paths, secrets, or write access.
- A compact dashboard-only chat popup replaces the assistant sidebar route; settings
  is account-focused rather than a separate guide. Old assistant links redirect.
- Plain-language plan text and care descriptions can be interpreted by Gemini into
  unconfirmed candidate fields. The user reviews them in the editor; AI never
  calculates cost or selects clinical timing.
- Find care now compares user-entered provider quotes through the deterministic
  claims engine. Live network status and negotiated fees are not available from
  the public map feed, so the old map is not presented as an insurance directory.
- The dashboard shows explicit engine-derived "Insurance pays" / "You pay" cards,
  annual remaining benefits, and a local in-app notice near renewal.
- Final polish adds a read-only chatbot context snapshot, next-best-action guidance,
  benefits-by-type modeling, clickable aggregate calculation receipts, and a
  print-friendly `/app/summary` export view. No outbound reminder delivery is claimed.

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
- Aggregate financial amount inspection (procedure receipts are inspectable).
- New signup, confirmation email and password recovery delivery acceptance tests.
- Outbound email/SMS reminders and live insurer network/price integrations are not
  implemented; the current reminder is in-app only. Network-specific benefit
  percentages are not represented by the current plan schema.

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
