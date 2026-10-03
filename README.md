# PlanPilot

Dental benefits planning with a working synthetic simulator, claim receipts, schedule comparisons, Supabase authentication, private PDF upload, Gemini-assisted plan extraction, and the shared Vintage Paper theme. See docs/STATUS.md for current scope and limitations.

## Local setup

Requires Node.js 22.13+ (Node 24 recommended) and npm.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

On PowerShell, use `Copy-Item .env.example .env.local`. Open http://localhost:3000. Home and /demo work without credentials; account forms clearly show setup is pending. Do not commit .env.local.

## Supabase setup

1. Create a Supabase project. Copy its project URL and publishable key (legacy anon key also supported) to .env.local:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
GEMINI_API_KEY=YOUR_GOOGLE_AI_STUDIO_KEY
GEMINI_MODEL=gemini-2.5-flash-lite
```

No service-role key is needed. `GEMINI_API_KEY` is server-only: never prefix it with `NEXT_PUBLIC_` or commit it. Public environment variables are bundled at build time; restart the dev server or redeploy after changing them. `NEXT_PUBLIC_SITE_URL` documents the canonical site URL for your project configuration; browser-initiated auth uses the current origin.

2. Run supabase/migrations/202610030001_initial.sql once in Supabase SQL Editor. Alternatively, with Supabase CLI installed:

```sh
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

3. In Authentication → URL Configuration set Site URL to http://localhost:3000 for local testing. Allow redirect URLs http://localhost:3000/auth/callback and http://localhost:3000/auth/callback?next=/reset-password. Add the equivalent exact production URLs when deploying.
4. Enable Email authentication and email confirmation. For links that also work when opened in another browser, configure these email templates:
   - Confirm signup link: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup`
   - Reset password link: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery`
   The standard Supabase PKCE redirect links are also supported through /auth/callback but require the initiating browser's verifier cookie. Templates using SiteURL go to that one environment; use a separate project or update SiteURL deliberately when testing local vs production.
5. Configure SMTP for production email delivery. Match the Supabase minimum password length to the UI's 12 characters.
6. Restart the app. Sign up, confirm email, sign in, open /app/settings, sign out, and test forgot-password → email → reset → sign in with the new password.

Private PDFs use `plan-documents/<user-id>/<document-id>-<filename>.pdf` (the object path starts with the authenticated user ID). The migration allows only PDFs up to 10 MiB. Text-based PDFs are parsed with PDF.js, then Gemini returns a Zod-validated, unconfirmed candidate with confidence and verified page quotes. Scanned PDFs and missing Gemini credentials fall back to manual entry. A user must confirm fields before the claims engine can use them. Create signed URLs only after authorization; never use public URLs.

For local AI extraction, create a Google AI Studio API key and add `GEMINI_API_KEY` to `.env.local`. The application never logs uploaded PDF text, sends monetary calculations to Gemini, or exposes the key in browser code.

## Routes

| Route | Scaffold behavior |
| --- | --- |
| / | Home page |
| /demo | Public preview shell; no calculation results |
| /sign-in, /sign-up | Email/password forms |
| /forgot-password, /reset-password | Recovery request and authenticated password update |
| /auth/callback, /auth/confirm | PKCE and token-hash email callbacks |
| /app | Protected dashboard shell |
| /app/plans | Protected plan editor, private PDF upload, and extraction review |
| /app/scenarios | Protected feature empty state |
| /app/scenarios/[id] | Reserved; returns not found until retrieval is implemented |
| /app/settings | Account email and recovery link |
| /api/plans, /api/scenarios | GET/POST guarded placeholders |
| /api/documents/upload | Authenticated private PDF upload and extraction |
| /api/ai/extract-plan | Authenticated Gemini extraction from a stored document or supplied text |
| /api/ai/explain | Reserved for Phase 9 receipt explanation |

API status codes: 503 when Supabase or Gemini is absent; 401 for unauthenticated callers; 422 when a document cannot be safely extracted. The upload route stores PDFs only in the private, owner-scoped bucket.

## Team handoff

**For consistent UI:** read [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md). It includes the visual contract, component examples and a copy-paste prompt for any teammate's AI. The single token source is src/styles/theme.css. Run npm run theme:check; GitHub CI checks for common hardcoded colors automatically. AGENTS.md and CODEX_START_PROMPT.md direct coding agents to the same system.

Start with AGENTS.md, CODEX_START_PROMPT.md, ARCHITECTURE.md and docs/STATUS.md. PLANPILOT_CODEX_MASTER_SPEC.md is the authoritative full product specification; the current scaffold milestone is intentionally smaller. Shared schemas live in src/lib/schemas. Feature folder README files identify future work without pretending it is implemented.

## Checks

```sh
npm run typecheck
npm run lint
npm run test
npm run build
```

Verified on October 3, 2026: dependency installation, typecheck, lint (zero warnings), all 20 Vitest tests, and production build passed. The public home page, authenticated plans editor, and extraction-review UI were checked in the browser. Live Gemini extraction requires a configured key.

Tests cover money/schema boundaries and redirect validation. Live auth, recovery email, database migration and two-account RLS/storage verification require a configured Supabase project. Check that account A cannot read/update account B's rows, reference B's documents/plans, or read B's storage paths before releasing persistence features.

## Deployment

Import this Git repository in Vercel with the Next.js preset. Add the public Supabase variables and canonical site URL; apply the migration and configure Supabase production Site URL/redirect allowlist/email templates. Run a production build and the auth smoke test. No deployment has been performed by the scaffold.

The repository contains no real patient data or external AI keys. Financial outputs remain deterministic engine results; Gemini only proposes document fields and prose-free structured data.

## Current connection and theme

The local project is connected through ignored .env.local. Read-only Supabase checks confirmed email signup and email confirmation are enabled, and all five tables exist with anonymous reads denied. No service-role credential is used. Teammates must create their own .env.local from .env.example; local credentials are not committed. The user reported the migration succeeded. Account creation, confirmation/recovery delivery and authenticated two-user database isolation remain manual acceptance checks.

The visual direction is the user's selected Vintage Paper palette from tweakcn, with compact Geist body text and restrained serif headings. DESIGN_SYSTEM.md is authoritative. Home, auth, dashboard, and receipts share src/styles/theme.css.

### Email-link troubleshooting

The Next.js server must have outbound HTTPS access to Supabase; a sandbox that denies sockets prevents server-side code exchange even when the browser can sign up. Callback messages distinguish connectivity, missing verifier/browser context, missing parameters and expired tokens. Sign-in/sign-up offer confirmation resend. Standard PKCE links must be opened in the initiating browser (the Codex browser and Chrome do not share cookies). For cross-browser confirmation use the token-hash email templates above. A Supabase confirmation can succeed before the app's code exchange fails, so try email/password sign-in first. Never paste confirmation tokens or complete email links into logs or chats.
