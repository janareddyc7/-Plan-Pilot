# PlanPilot

PlanPilot is a dental-benefits planning workspace. A person enters confirmed plan rules and dentist-provided care details; deterministic TypeScript code then estimates the plan payment, the patient's responsibility, and the impact of dentist-approved schedule options.

**AI proposes. You verify. Code computes.**

> Educational estimates only. Confirm coverage, procedure coding, network participation, claim dates, and treatment timing with the insurer and dentist. PlanPilot is not a substitute for a plan document, claim determination, or clinical advice.

## Evaluator Quick Start

The application is at the repository root. There is no Dockerfile.

```sh
npm ci && npm run build && npm run start
```

The public home page builds and starts without credentials. The account workspace requires a configured Supabase project because it stores private, owner-scoped plan data. AI-assisted extraction is optional; manual entry remains available when `GEMINI_API_KEY` is absent.

## What It Does

| Capability          | How it works                                                                                                                                                                                                                     |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Plan entry          | Captures annual maximum, deductible, coverage by service class, network rules, renewal date, and prior benefit use. Plan text and PDFs can produce unconfirmed suggestions for review.                                           |
| Care entry          | Captures a plain-language procedure description, estimated billed and allowed amounts, network status, and dentist-approved timing windows. A small, clearly labeled benchmark can fill a missing quote for supported CDT codes. |
| Claim receipts      | Applies the deductible, service-class coverage, network adjustment, annual maximum, waiting periods, and confirmed frequency rules in chronological order.                                                                       |
| Schedule comparison | Enumerates bounded, dentist-approved date options and chooses the feasible option with the lowest estimated patient responsibility. Original, current, and recommended schedules stay separate.                                  |
| Explanation         | Shows itemized receipts and source/assumption notes. AI can explain already-calculated values but cannot create financial figures.                                                                                               |
| Private workspace   | Uses Supabase Auth, owner-scoped tables, RLS, and private PDF storage.                                                                                                                                                           |

All money is stored and calculated as integer cents. Percentages are whole numbers, so `80` means 80%.

## Estimate Order

For each procedure, ordered by its selected service date, the engine:

1. Resolves billed and allowed amounts and any in-network write-off or out-of-network gap.
2. Checks confirmed waiting-period and frequency rules.
3. Applies the remaining deductible when it applies to that service class.
4. Applies the confirmed coverage percentage to the remaining allowed amount.
5. Caps the plan payment at the remaining annual maximum for that benefit year.
6. Produces a receipt with insurer payment, patient payment, remaining deductible, remaining annual maximum, and assumptions.

The optimizer never moves urgent, fixed, dependent, or out-of-window care. It only compares dates the dentist has approved. It does not decide whether delaying care is clinically appropriate.

## Local Setup

Requires Node.js 22.13 or later; Node.js 24 is recommended.

```sh
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Do not commit `.env.local`.

### Environment Variables

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
GEMINI_API_KEY=YOUR_GOOGLE_AI_STUDIO_KEY
GEMINI_MODEL=gemini-3.5-flash-lite
```

Only the Supabase URL and publishable/anon key are public. `GEMINI_API_KEY` is server-only; never prefix it with `NEXT_PUBLIC_`.

### Supabase Setup

1. Create a Supabase project and add the variables above to `.env.local`.
2. Apply both migrations in `supabase/migrations/` in chronological order, either in the Supabase SQL editor or with the CLI:

   ```sh
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   ```

3. Enable Email authentication and configure the Site URL and redirect URLs for your local or deployed origin.
4. For cross-browser confirmation and recovery links, use Supabase token-hash email templates that point to `/auth/confirm`.

PlanPilot never requires a Supabase service-role key.

## Quality Checks

Run these before submitting:

```sh
npm run theme:check
npm run typecheck
npm run lint
npm run test
npm run build
```

Tests cover the shared schemas, claim waterfall, annual maximum and deductible behavior, benefit-year reset, network accounting, frequency limits, schedule feasibility, optimizer, AI-output safety boundaries, and renewal reminders.

## Project Map

```text
src/app/                 Routes, protected workspace, and API handlers
src/components/          UI and accessible client interactions
src/lib/schemas/         Shared Zod contracts and inferred types
src/lib/insurance/       Pure deterministic claims and benefit-rule logic
src/lib/optimization/    Feasibility checks and bounded schedule search
src/lib/ai/              Server-only extraction and safe explanation helpers
src/lib/supabase/        Browser/server Supabase clients and configuration
src/store/               In-memory workspace state
supabase/migrations/     Owner-scoped schema, RLS, and private storage rules
tests/                   Vitest coverage for core behavior
```

## Deployment

Deploy with the Next.js preset, then configure the public Supabase values, canonical `NEXT_PUBLIC_SITE_URL`, and optional server-only Gemini key. Apply the migrations to the production Supabase project and add the production authentication redirect URLs. Run the quality checks above and verify sign-up, confirmation, sign-in, private upload, and two-account isolation before release.
