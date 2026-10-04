# Start here: PlanPilot team scaffold

You are joining a shared Next.js application. Read AGENTS.md, README.md, ARCHITECTURE.md, docs/STATUS.md, then PLANPILOT_CODEX_MASTER_SPEC.md completely before implementing your assigned feature.

Read DESIGN_SYSTEM.md for all UI work. Preserve PlanPilot Solar Dusk, use src/styles/theme.css tokens, and reuse src/components/ui primitives. Match existing page compositions. No new palette, font or visual identity unless the user requests one. Run npm run theme:check before handoff. This applies regardless of which AI assistant the teammate uses.

The user deliberately narrowed the initial milestone to a project scaffold: home and auth pages, protected route shells, Supabase setup/migration, shared Zod schemas and teammate documentation. Do not interpret the full product specification as permission to implement every feature immediately. Follow the current teammate's assigned scope.

Use src/lib/schemas as the shared contract. State proposed contract changes before implementing dependent logic. Check existing work before creating duplicate components or types. Keep every financial result tied to a future deterministic engine and retain honest placeholder states until that engine exists.

At handoff, describe changed files, commands and results, required environment/setup actions, and any remaining limitations. Never say auth or RLS has been tested against a live Supabase project unless it has.
