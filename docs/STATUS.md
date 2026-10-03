# Current milestone: application scaffold

Implemented: Next.js foundation, responsive home page, public workspace preview, sign-in/sign-up/recovery/reset forms, sign-out, email callback and token confirmation routes, session proxy, protected workspace shells, guarded placeholder APIs, shared Zod contracts, initial Supabase migration/private storage policies, contract tests and team documentation.

Not implemented in this milestone: claims engine, optimizer, synthetic interactive Dev scenario, plan/procedure editor, PDF parsing/upload UI, AI calls, live receipt/explanation UI, save/restore CRUD, charts, drag/drop, billing, OAuth provider buttons, deployment. The /demo route is explicitly a workspace preview, not the finished master-spec demo.

Connected Supabase on October 3, 2026 using the user's project URL and publishable key in ignored .env.local. Read-only checks verified email signup enabled, confirmation required, and all five tables present with anonymous reads denied. User reported successfully applying the migration. Auth with a real account, two-user RLS isolation, private storage access and recovery email delivery still need end-to-end verification; public-key checks cannot inspect dashboard redirect settings or all policies.

The user subsequently selected tweakcn Perpetuity as the new visual direction. Home and all auth pages now use its light palette, fine borders, and monospace accents, with Geist retained for primary reading/headings. This explicit preference supersedes the master spec's original palette. Account forms include password visibility, loading, validation, success and rate-limit states.

Next milestone should freeze shared schemas with the engine teammate and implement golden claim tests before displaying financial results.
