# Working together

All UI contributors and their coding agents must read DESIGN_SYSTEM.md. Reuse the existing Perpetuity tokens and UI primitives. Run npm run theme:check; do not resolve a theme failure by disabling the check. Intentional visual identity changes should update the central tokens and design documentation together.

1. Read AGENTS.md and docs/STATUS.md; agree on one feature and the folders it owns.
2. Branch from the shared base with codex/<feature> (or your team's chosen branch convention).
3. Discuss schema changes first. Add migrations as new files after the initial migration is applied anywhere; never rewrite applied migrations.
4. Keep commits focused. Do not overwrite another teammate's changes, commit secrets, or use real member documents in fixtures.
5. Run typecheck, lint, tests and build. Include outcomes and a short manual test in your PR.
6. Update docs/STATUS.md and README when behavior or setup changes.

Suggested feature ownership: engine/optimizer; dashboard/timeline; AI/PDF intake; persistence/integration. This is a coordination suggestion, not authorization for automated agents to start all lanes.

Use the installed shadcn conventions for components. Add Motion, dnd-kit, Recharts and the Vercel AI SDK when their features are implemented; the current scaffold avoids unused feature dependencies. Zustand is available for future simulator state. Preserve public preview access when account services are unavailable.
