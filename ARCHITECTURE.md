# Architecture

Next.js App Router, React, strict TypeScript and Tailwind v4 form one application. Geist fonts are installed locally through the geist package. UI foundations use the shadcn new-york convention, Radix Slot and lucide-react. Forms use React Hook Form with shared Zod validation. The lockfile pins the resolved dependency graph.

Current design override (user request, October 3): Perpetuity light theme from https://tweakcn.com/editor/theme?theme=perpetuity. Tokens are in src/app/globals.css; use semantic colors instead of hardcoded white surfaces. Original palette source: https://github.com/jnsahaj/tweakcn/blob/main/utils/theme-presets.ts. Geist is retained for readable editorial headings/body; Courier New follows the theme for small labels and monospace details. This is a palette-based adaptation, not the preset's all-monospace typography.

## Boundaries

Theme values now live in src/styles/theme.css; globals.css imports them and exposes Tailwind utilities. DESIGN_SYSTEM.md owns the visual contract. UI primitives are shared through components/ui. The theme:check script in CI catches common raw colors outside the token file.

- src/app: routes and server layouts. Public home/demo; auth group; protected /app area. API placeholders deliberately return 503, 401 or 501.
- src/components: presentation and client interactions. Feature folders are reserved for future implementation.
- src/lib/schemas: strict shared contracts; exported inferred TypeScript types. Never duplicate contracts in routes or components.
- src/lib/supabase: browser/server cookie clients. src/proxy.ts refreshes and verifies sessions; server layouts and future route handlers independently verify authorization.
- src/lib/auth: safe local redirects. /auth/callback handles PKCE codes; /auth/confirm handles token-hash email confirmation and recovery links.
- src/lib/insurance and src/lib/optimization: reserved pure deterministic modules. No network, React, environment variables or AI dependencies.
- src/store: reserved Zustand client state. Persist only guest drafts and preferences; account records belong in Supabase.
- supabase/migrations: versioned SQL. Owner-scoped RLS and composite foreign keys prevent cross-account references.

## Contract decisions

Money is a nonnegative safe integer in cents; savings can be signed. Percentages are integers from 0 to 100. Dates are ISO calendar dates, timestamps are UTC ISO datetimes, IDs are UUIDs. Renewal dates must exist every year (February 29 is rejected until an explicit leap-year policy is added). usageAsOfDate anchors starting deductible and annual maximum usage to a benefit year; never silently apply starting usage to every year.

Shared schemas are a v0 contract, not a finished calculation implementation. Unknown fields currently cover annual maximum, deductible, major/basic coverage. Extend deliberately for procedure-class uncertainties. Cross-record schedule feasibility, dependency cycles, reference integrity, field/template compatibility and receipt arithmetic require the future domain engine and semantic explanation validator. Zod shape validation alone is insufficient.

Future engine rounding: round covered-base cents times integer coverage percentage to nearest cent, half up, before annual maximum cap. All allocation and benefit-year choices must be documented and tested by the engine teammate.

Database JSONB stores contract snapshots; future API writes must parse Zod, reconcile record IDs and owner IDs, and keep authoritative receipt computation server-side. An object-level SQL check does not replace domain validation. Procedures may reference an optional scenario; future API validation must also verify that the scenario belongs to the same plan.

## Future data flow

Plan prose/PDF → AI candidate fields → human confirmation → typed plan and procedures → deterministic engine → valid-schedule optimizer → UI/receipts → authenticated save. AI explanations resolve approved template and receipt-field references through code. No free-form monetary prose is trusted.
